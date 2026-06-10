import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerComponent } from './date-picker.component';

describe('DatePickerComponent', () => {
  let fixture: ComponentFixture<DatePickerComponent>;
  let component: DatePickerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DatePickerComponent] }).compileComponents();
    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the placeholder when no value is set', () => {
    fixture.componentRef.setInput('placeholder', 'Pick a date');
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.date-picker__trigger');
    expect(trigger.textContent).toContain('Pick a date');
  });

  it('opens the calendar popover on click', () => {
    fixture.nativeElement.querySelector('.date-picker__trigger').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.date-picker__pop')).not.toBeNull();
    // 6 weeks * 7 days = 42 day cells.
    expect(fixture.nativeElement.querySelectorAll('.date-picker__day').length).toBe(42);
  });

  it('writes an ISO value and renders it formatted', () => {
    component.writeValue('2026-06-15');
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.date-picker__trigger');
    expect(trigger.textContent).toContain('Jun');
    expect(trigger.textContent).toContain('2026');
  });

  it('emits the ISO date through the form value accessor on selection', () => {
    const changed: string[] = [];
    component.registerOnChange((v: string) => changed.push(v));
    component.writeValue('2026-06-15');
    fixture.detectChanges();

    component.select({ date: '2026-06-20', day: 20, inMonth: true });
    expect(changed).toEqual(['2026-06-20']);
    expect(component.value()).toBe('2026-06-20');
  });

  it('emits dateChange for non-form usage', () => {
    const emitted: string[] = [];
    component.dateChange.subscribe((v) => emitted.push(v));
    component.select({ date: '2026-07-01', day: 1, inMonth: true });
    expect(emitted).toEqual(['2026-07-01']);
  });

  it('respects min/max bounds', () => {
    fixture.componentRef.setInput('min', '2026-06-10');
    fixture.componentRef.setInput('max', '2026-06-20');
    fixture.detectChanges();
    expect(component.isDisabledDate('2026-06-09')).toBe(true);
    expect(component.isDisabledDate('2026-06-15')).toBe(false);
    expect(component.isDisabledDate('2026-06-21')).toBe(true);
  });

  it('jumps to a year then a month in two clicks (fast DOB selection)', () => {
    component.writeValue('2026-06-15');
    fixture.detectChanges();

    component.showYears();
    expect(component.view()).toBe('years');

    component.selectYear(1995);
    expect(component.view()).toBe('months');
    expect(component.yearNumber()).toBe(1995);

    component.selectMonth(3); // April
    expect(component.view()).toBe('days');
    expect(component.monthName()).toBe('April');

    // The day grid now reflects April 1995 — selecting a day gives that date.
    component.select({ date: '1995-04-10', day: 10, inMonth: true });
    expect(component.value()).toBe('1995-04-10');
  });

  it('year grid is bounded by min/max (newest first)', () => {
    fixture.componentRef.setInput('min', '1990-01-01');
    fixture.componentRef.setInput('max', '2026-12-31');
    fixture.detectChanges();
    const years = component.years();
    expect(years[0]).toBe(2026);
    expect(years[years.length - 1]).toBe(1990);
  });
});
