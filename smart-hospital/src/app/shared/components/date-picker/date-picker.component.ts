import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface DayCell {
  date: string; // ISO yyyy-mm-dd
  day: number;
  inMonth: boolean;
}

type View = 'days' | 'months' | 'years';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Custom, fully-styled date picker (a calendar popover) that works as a drop-in
 * reactive-form control via ControlValueAccessor — replaces the native
 * <input type="date"> whose OS popup can't be themed.
 *
 * Value is an ISO date string 'yyyy-mm-dd' (matching the native date input), so
 * existing form validators and the backend contract are unchanged.
 */
@Component({
  selector: 'app-date-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  private host = inject(ElementRef<HTMLElement>);

  placeholder = input('Select a date');
  /** Optional ISO bounds, e.g. min="1925-01-01" max="2026-12-31". */
  min = input<string | null>(null);
  max = input<string | null>(null);
  dataCy = input<string>('');
  /** Emitted on selection — for non-form usage (`[value]` + `(dateChange)`). */
  dateChange = output<string>();

  readonly open = signal(false);
  readonly value = signal<string>(''); // ISO yyyy-mm-dd
  readonly disabled = signal(false);
  /** Which panel is showing: day grid, month grid, or year grid. */
  readonly view = signal<View>('days');

  // The month currently shown in the popover (1st of that month).
  private readonly viewDate = signal<Date>(this.startOfMonth(new Date()));

  readonly monthName = computed(() => MONTHS[this.viewDate().getMonth()]);
  readonly yearNumber = computed(() => this.viewDate().getFullYear());
  readonly months = MONTHS_SHORT;
  readonly weekdays = WEEKDAYS;

  /** Year range for the year grid — bounded by min/max when provided, else a wide
   *  window around the view year (covers DOB without endless clicking). */
  readonly years = computed<number[]>(() => {
    const current = this.viewDate().getFullYear();
    const minYear = this.min() ? Number(this.min()!.slice(0, 4)) : current - 100;
    const maxYear = this.max() ? Number(this.max()!.slice(0, 4)) : current + 10;
    const out: number[] = [];
    // Newest first so a DOB picker opens near recent years.
    for (let y = maxYear; y >= minYear; y--) out.push(y);
    return out;
  });

  readonly displayValue = computed(() => {
    const v = this.value();
    if (!v) return '';
    const d = this.parseIso(v);
    return d
      ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '';
  });

  readonly cells = computed<DayCell[]>(() => {
    const view = this.viewDate();
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const start = new Date(year, month, 1 - firstWeekday);
    const out: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push({ date: this.toIso(d), day: d.getDate(), inMonth: d.getMonth() === month });
    }
    return out;
  });

  // ── ControlValueAccessor ──
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
    if (value) {
      const d = this.parseIso(value);
      if (d) this.viewDate.set(this.startOfMonth(d));
    }
  }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  // ── Interaction ──
  toggle(): void {
    if (this.disabled()) return;
    this.open.update((o) => !o);
    if (this.open()) {
      this.view.set('days');
      const d = this.value() ? this.parseIso(this.value()) : new Date();
      if (d) this.viewDate.set(this.startOfMonth(d));
    } else {
      this.onTouched();
    }
  }

  /** Step the prev/next button: month in day view, year in month view, decade in year view. */
  prev(): void { this.step(-1); }
  next(): void { this.step(1); }

  /** Open the month grid (clicking the month name) or year grid (clicking the year). */
  showMonths(): void { this.view.set('months'); }
  showYears(): void { this.view.set('years'); }

  selectMonth(monthIndex: number): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), monthIndex, 1));
    this.view.set('days');
  }

  selectYear(year: number): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(year, d.getMonth(), 1));
    this.view.set('months');
  }

  isCurrentMonth(monthIndex: number): boolean {
    return this.viewDate().getMonth() === monthIndex;
  }
  isCurrentYear(year: number): boolean {
    return this.viewDate().getFullYear() === year;
  }

  select(cell: DayCell): void {
    if (this.isDisabledDate(cell.date)) return;
    this.value.set(cell.date);
    this.onChange(cell.date);
    this.dateChange.emit(cell.date);
    this.open.set(false);
    this.view.set('days');
    this.onTouched();
  }

  isSelected(date: string): boolean { return this.value() === date; }
  isToday(date: string): boolean { return date === this.toIso(new Date()); }

  isDisabledDate(date: string): boolean {
    const min = this.min();
    const max = this.max();
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
      this.onTouched();
    }
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.open()) { this.open.set(false); this.onTouched(); }
  }

  // ── Helpers ──
  private step(delta: number): void {
    const d = this.viewDate();
    const view = this.view();
    if (view === 'months') {
      this.viewDate.set(new Date(d.getFullYear() + delta, d.getMonth(), 1));
    } else {
      // day view: step a month
      this.viewDate.set(new Date(d.getFullYear(), d.getMonth() + delta, 1));
    }
  }
  private startOfMonth(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), 1); }
  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  private parseIso(v: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
}
