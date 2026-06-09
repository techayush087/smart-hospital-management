import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { vi } from 'vitest';
import { RescheduleModalComponent } from './reschedule-modal.component';
import { Appointment, TimeSlot } from '../../../../core/models';
import {
  initialAppointmentCatalogState,
  rescheduleAppointment,
} from '../../../../store/appointment-catalog';

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    patientId: 'p1',
    doctorId: 'd1',
    scheduledAt: '2026-07-01T10:00:00.000Z',
    duration: 30,
    type: 'in-person',
    status: 'confirmed',
    reason: 'Annual checkup',
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    ...overrides,
  };
}

function makeSlot(overrides: Partial<TimeSlot> = {}): TimeSlot {
  return {
    id: 's1',
    doctorId: 'd1',
    startTime: '2026-07-02T09:00:00.000Z',
    endTime: '2026-07-02T09:30:00.000Z',
    isAvailable: true,
    type: 'in-person',
    ...overrides,
  };
}

describe('RescheduleModalComponent', () => {
  let fixture: ComponentFixture<RescheduleModalComponent>;
  let store: MockStore;

  beforeEach(async () => {
    const slot = makeSlot();
    await TestBed.configureTestingModule({
      imports: [RescheduleModalComponent],
      providers: [
        provideMockStore({
          initialState: {
            appointmentCatalog: {
              ...initialAppointmentCatalogState,
              availableSlots: [slot],
              selectedSlot: slot,
            },
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RescheduleModalComponent);
    store = TestBed.inject(MockStore);
    fixture.componentRef.setInput('appointment', makeAppointment());
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  it('renders available slots', () => {
    const slots = fixture.nativeElement.querySelectorAll(
      '[data-cy="reschedule-slot"]',
    );
    expect(slots.length).toBe(1);
  });

  it('dispatches rescheduleAppointment when confirm is clicked', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const confirmBtn: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="reschedule-confirm"] button',
    );
    confirmBtn.click();

    expect(dispatch).toHaveBeenCalledWith(
      rescheduleAppointment({
        appointmentId: 'a1',
        newSlot: makeSlot(),
      }),
    );
  });
});
