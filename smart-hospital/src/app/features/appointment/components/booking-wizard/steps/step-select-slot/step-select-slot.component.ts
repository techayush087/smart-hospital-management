import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
  loadDoctorSlots,
  selectAvailableSlots,
  selectSelectedSlot,
  selectSlot,
  selectSlotsLoading,
} from '../../../../../../store/appointment-catalog';
import { TimeSlot } from '../../../../../../core/models';
import { TimeSlotPipe } from '../../../../../../shared/pipes/time-slot.pipe';
import { DatePickerComponent } from '../../../../../../shared/components/date-picker/date-picker.component';
import { isDateInPast, isToday, toISODate } from '../../../../../../shared/utils/date.utils';

@Component({
  selector: 'app-step-select-slot',
  standalone: true,
  imports: [TimeSlotPipe, DatePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-select-slot.component.html',
  styleUrl: './step-select-slot.component.css',
})
export class StepSelectSlotComponent {
  private readonly store = inject(Store);

  readonly doctorId = input.required<string>();

  protected readonly selectedDate = signal('');
  protected readonly today = toISODate(new Date());

  private readonly allSlots = toSignal(this.store.select(selectAvailableSlots), {
    initialValue: [] as TimeSlot[],
  });

  /** Slots to show: on today, drop any whose start time has already passed; on a
   *  future date, show them all. Prevents booking a slot in the past. */
  protected readonly slots = computed<TimeSlot[]>(() => {
    const list = this.allSlots();
    const date = this.selectedDate();
    if (!date || !isToday(date)) return list;
    return list.filter((s) => !isDateInPast(s.startTime));
  });

  protected readonly slotsLoading = toSignal(
    this.store.select(selectSlotsLoading),
    { initialValue: false },
  );
  protected readonly selectedSlot = toSignal(
    this.store.select(selectSelectedSlot),
    { initialValue: null as TimeSlot | null },
  );

  onDateChange(date: string): void {
    this.selectedDate.set(date);
    if (date) {
      this.store.dispatch(
        loadDoctorSlots({ doctorId: this.doctorId(), date }),
      );
    }
  }

  onSelectSlot(slot: TimeSlot): void {
    if (!slot.isAvailable) return;
    this.store.dispatch(selectSlot({ slot }));
  }
}
