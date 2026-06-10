import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { vi } from 'vitest';
import { AppointmentCatalogEffects } from './appointment-catalog.effects';
import * as A from './appointment-catalog.actions';
import { DoctorService } from '../../features/doctors/services/doctor.service';
import { AppointmentService } from '../../features/appointment/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationApiService } from '../../features/notifications/services/notification-api.service';
import { Appointment, TimeSlot, BookingRequest } from '../../core/models';

const slot: TimeSlot = {
  id: 's1',
  doctorId: 'd1',
  startTime: '2026-06-10T09:00:00.000Z',
  endTime: '2026-06-10T09:30:00.000Z',
  isAvailable: true,
  type: 'in-person',
};

const appointment: Appointment = {
  id: 'a1',
  patientId: 'p1',
  doctorId: 'd1',
  scheduledAt: '2026-06-10T09:00:00.000Z',
  duration: 30,
  type: 'in-person',
  status: 'confirmed',
  reason: 'Checkup',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

const booking: BookingRequest = {
  doctorId: 'd1',
  slotId: 's1',
  patientId: 'p1',
  scheduledAt: '2026-06-10T09:00:00.000Z',
  duration: 30,
  type: 'in-person',
  reason: 'Checkup',
  consultationType: 'in-person',
  urgency: 'routine',
};

describe('AppointmentCatalogEffects', () => {
  let effects: AppointmentCatalogEffects;
  let actions$: Observable<Action>;
  let doctorService: { getAvailableSlots: ReturnType<typeof vi.fn> };
  let appointmentService: {
    getAppointments: ReturnType<typeof vi.fn>;
    bookAppointment: ReturnType<typeof vi.fn>;
    cancelAppointment: ReturnType<typeof vi.fn>;
    rescheduleAppointment: ReturnType<typeof vi.fn>;
  };
  let notify: { addTransient: ReturnType<typeof vi.fn> };
  let notifyApi: { create: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    doctorService = { getAvailableSlots: vi.fn(() => of([slot])) };
    appointmentService = {
      getAppointments: vi.fn(() => of([appointment])),
      bookAppointment: vi.fn(() => of(appointment)),
      cancelAppointment: vi.fn(() => of({ ...appointment, status: 'cancelled' })),
      rescheduleAppointment: vi.fn(() =>
        of({ ...appointment, status: 'rescheduled' }),
      ),
    };
    notify = { addTransient: vi.fn() };
    notifyApi = { create: vi.fn(() => of({})) };

    TestBed.configureTestingModule({
      providers: [
        AppointmentCatalogEffects,
        provideMockActions(() => actions$),
        { provide: DoctorService, useValue: doctorService },
        { provide: AppointmentService, useValue: appointmentService },
        { provide: AuthService, useValue: { getCurrentUser: () => () => ({ id: 'u1' }) } },
        { provide: NotificationService, useValue: notify },
        { provide: NotificationApiService, useValue: notifyApi },
      ],
    });

    effects = TestBed.inject(AppointmentCatalogEffects);
  });

  it('loadDoctorSlots$ emits loadDoctorSlotsSuccess with the slots', () =>
    new Promise<void>((resolve) => {
      actions$ = of(A.loadDoctorSlots({ doctorId: 'd1', date: '2026-06-10' }));
      effects.loadDoctorSlots$.subscribe((action) => {
        expect(action).toEqual(A.loadDoctorSlotsSuccess({ slots: [slot] }));
        expect(doctorService.getAvailableSlots).toHaveBeenCalledWith(
          'd1',
          '2026-06-10',
        );
        resolve();
      });
    }));

  it('loadCatalog$ emits loadAppointmentCatalogSuccess for the current user', () =>
    new Promise<void>((resolve) => {
      actions$ = of(A.loadAppointmentCatalog());
      effects.loadCatalog$.subscribe((action) => {
        expect(action).toEqual(
          A.loadAppointmentCatalogSuccess({ appointments: [appointment] }),
        );
        expect(appointmentService.getAppointments).toHaveBeenCalledWith('u1');
        resolve();
      });
    }));

  it('bookSlot$ emits bookSlotSuccess and notifies', () =>
    new Promise<void>((resolve) => {
      actions$ = of(A.bookSlot({ booking }));
      effects.bookSlot$.subscribe((action) => {
        expect(action).toEqual(A.bookSlotSuccess({ appointment }));
        expect(appointmentService.bookAppointment).toHaveBeenCalledWith(booking);
        // Instant toast to the actor...
        expect(notify.addTransient).toHaveBeenCalledTimes(1);
        expect(notify.addTransient.mock.calls[0][0]).toMatchObject({ type: 'confirmation' });
        // ...and a persisted record for the recipient.
        expect(notifyApi.create).toHaveBeenCalledTimes(1);
        expect(notifyApi.create.mock.calls[0][0]).toMatchObject({
          type: 'confirmation',
          userId: booking.patientId,
        });
        resolve();
      });
    }));

  it('cancelAppointment$ emits cancelAppointmentSuccess and notifies', () =>
    new Promise<void>((resolve) => {
      actions$ = of(A.cancelAppointment({ appointmentId: 'a1' }));
      effects.cancelAppointment$.subscribe((action) => {
        expect(action.type).toBe(A.cancelAppointmentSuccess.type);
        expect(appointmentService.cancelAppointment).toHaveBeenCalledWith('a1');
        expect(notify.addTransient).toHaveBeenCalledTimes(1);
        expect(notifyApi.create).toHaveBeenCalledTimes(1);
        expect(notifyApi.create.mock.calls[0][0]).toMatchObject({ type: 'cancellation' });
        resolve();
      });
    }));

  it('rescheduleAppointment$ emits rescheduleAppointmentSuccess and notifies', () =>
    new Promise<void>((resolve) => {
      actions$ = of(
        A.rescheduleAppointment({ appointmentId: 'a1', newSlot: slot }),
      );
      effects.rescheduleAppointment$.subscribe((action) => {
        expect(action.type).toBe(A.rescheduleAppointmentSuccess.type);
        expect(
          appointmentService.rescheduleAppointment,
        ).toHaveBeenCalledWith('a1', slot);
        expect(notify.addTransient).toHaveBeenCalledTimes(1);
        expect(notifyApi.create).toHaveBeenCalledTimes(1);
        expect(notifyApi.create.mock.calls[0][0]).toMatchObject({ type: 'reschedule' });
        resolve();
      });
    }));
});
