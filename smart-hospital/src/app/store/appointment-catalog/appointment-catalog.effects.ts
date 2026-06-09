import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  switchMap,
  map,
  catchError,
  exhaustMap,
  mergeMap,
  tap,
} from 'rxjs/operators';
import { DoctorService } from '../../features/doctors/services/doctor.service';
import { AppointmentService } from '../../features/appointment/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import * as A from './appointment-catalog.actions';

@Injectable()
export class AppointmentCatalogEffects {
  private actions$ = inject(Actions);
  private doctorService = inject(DoctorService);
  private appointmentService = inject(AppointmentService);
  private auth = inject(AuthService);
  private notify = inject(NotificationService);

  loadDoctorSlots$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.loadDoctorSlots),
      switchMap(({ doctorId, date }) =>
        this.doctorService.getAvailableSlots(doctorId, date).pipe(
          map((slots) => A.loadDoctorSlotsSuccess({ slots })),
          catchError((error) =>
            of(A.loadDoctorSlotsFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  loadCatalog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.loadAppointmentCatalog),
      switchMap(() => {
        const patientId = this.auth.getCurrentUser()()?.id ?? '';
        return this.appointmentService.getAppointments(patientId).pipe(
          map((appointments) =>
            A.loadAppointmentCatalogSuccess({ appointments }),
          ),
          catchError((error) =>
            of(A.loadAppointmentCatalogFailure({ error: error.message })),
          ),
        );
      }),
    ),
  );

  bookSlot$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.bookSlot),
      exhaustMap(({ booking }) =>
        this.appointmentService.bookAppointment(booking).pipe(
          map((appointment) => A.bookSlotSuccess({ appointment })),
          tap(() =>
            this.notify.addNotification({
              id: `n-${Date.now()}`,
              userId: booking.patientId,
              type: 'confirmation',
              title: 'Appointment booked',
              message: 'Your appointment is confirmed.',
              read: false,
              createdAt: new Date().toISOString(),
            }),
          ),
          catchError((error) =>
            of(A.bookSlotFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  cancelAppointment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.cancelAppointment),
      mergeMap(({ appointmentId }) =>
        this.appointmentService.cancelAppointment(appointmentId).pipe(
          map((appointment) => A.cancelAppointmentSuccess({ appointment })),
          tap(() =>
            this.notify.addNotification({
              id: `n-${Date.now()}`,
              userId: '',
              type: 'cancellation',
              title: 'Appointment cancelled',
              message: 'Your appointment was cancelled.',
              read: false,
              createdAt: new Date().toISOString(),
            }),
          ),
          catchError((error) =>
            of(A.cancelAppointmentFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );

  rescheduleAppointment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(A.rescheduleAppointment),
      mergeMap(({ appointmentId, newSlot }) =>
        this.appointmentService.rescheduleAppointment(appointmentId, newSlot).pipe(
          map((appointment) => A.rescheduleAppointmentSuccess({ appointment })),
          tap(() =>
            this.notify.addNotification({
              id: `n-${Date.now()}`,
              userId: '',
              type: 'reschedule',
              title: 'Appointment rescheduled',
              message: 'Your appointment was moved.',
              read: false,
              createdAt: new Date().toISOString(),
            }),
          ),
          catchError((error) =>
            of(A.rescheduleAppointmentFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );
}
