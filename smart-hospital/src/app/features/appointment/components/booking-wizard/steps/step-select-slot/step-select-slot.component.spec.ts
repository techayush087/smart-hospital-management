import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { StepSelectSlotComponent } from './step-select-slot.component';
import { TimeSlot } from '../../../../../../core/models';
import {
  selectAvailableSlots,
  selectSelectedSlot,
  selectSlotsLoading,
} from '../../../../../../store/appointment-catalog';
import { toISODate } from '../../../../../../shared/utils/date.utils';

/** Build a slot whose start is `hoursFromNow` away (negative = already passed). */
function slotAt(id: string, hoursFromNow: number): TimeSlot {
  const start = new Date(Date.now() + hoursFromNow * 3_600_000);
  const end = new Date(start.getTime() + 30 * 60_000);
  return {
    id,
    doctorId: 'd1',
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    isAvailable: true,
    type: 'in-person',
  };
}

describe('StepSelectSlotComponent', () => {
  let fixture: ComponentFixture<StepSelectSlotComponent>;
  let store: MockStore;

  const past = slotAt('past', -2); // 2h ago — today, already passed
  const future = slotAt('future', 2); // 2h from now — today, still bookable

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepSelectSlotComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectAvailableSlots, [past, future]);
    store.overrideSelector(selectSelectedSlot, null);
    store.overrideSelector(selectSlotsLoading, false);

    fixture = TestBed.createComponent(StepSelectSlotComponent);
    fixture.componentRef.setInput('doctorId', 'd1');
    fixture.detectChanges();
  });

  function slotButtons(): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('[data-cy="slot"]'),
    );
  }

  it('hides slots whose time has already passed when the date is today', () => {
    fixture.componentInstance.onDateChange(toISODate(new Date()));
    fixture.detectChanges();

    const buttons = slotButtons();
    // Only the future-time slot survives; the past one is dropped.
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toContain(
      new Date(future.startTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    );
  });

  it('shows all slots for a future date (no past-time filtering)', () => {
    const tomorrow = toISODate(new Date(Date.now() + 86_400_000));
    fixture.componentInstance.onDateChange(tomorrow);
    fixture.detectChanges();

    // Future date: both slots show regardless of time-of-day.
    expect(slotButtons().length).toBe(2);
  });
});
