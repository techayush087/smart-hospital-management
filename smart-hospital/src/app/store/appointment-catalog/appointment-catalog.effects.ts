import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
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
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationApiService } from '../../features/notifications/services/notification-api.service';
import { Notification, User } from '../../core/models';
import * as A from './appointment-catalog.actions';

@Injectable()
export class AppointmentCatalogEffects {
  private actions$ = inject(Actions);
  private doctorService = inject(DoctorService);
  private appointmentService = inject(AppointmentService);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private notify = inject(NotificationService);
  private notifyApi = inject(NotificationApiService);

  /** Show an instant in-memory toast to the current actor + persist a DB record
   *  so the recipient (which may be a different user) sees it on their next poll. */
  private emit(
    recipientId: string,
    type: Notification['type'],
    title: string,
    message: string,
    toastToActor = true,
  ): void {
    if (toastToActor) {
      this.notify.addTransient({
        id: `local-${Date.now()}`,
        userId: recipientId,
        type,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    if (recipientId) {
      this.notifyApi
        .create({ userId: recipientId, type, title, message })
        .subscribe({ error: () => undefined });
    }
  }

  /** Persist an alert for every admin so they see new patient activity on their
   *  next poll (no toast — the actor is the patient, not an admin). */
  private emitToAdmins(
    title: string,
    message: string,
    relatedEntityId?: string,
  ): void {
    this.api
      .get<User[]>('/users', new HttpParams().set('role', 'admin'))
      .subscribe({
        next: (admins) => {
          for (const admin of admins) {
            this.notifyApi
              .create({
                userId: admin.id,
                type: 'admin-alert',
                title,
                message,
                relatedEntityId,
              })
              .subscribe({ error: () => undefined });
          }
        },
        error: () => undefined,
      });
  }

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
          tap((action) => {
            // Tell the patient their request is in.
            this.emit(
              booking.patientId,
              'reminder',
              'Appointment requested',
              'Your appointment request was submitted and is awaiting confirmation.',
            );
            // Alert every admin so the new request shows up in their bell.
            this.emitToAdmins(
              'New appointment request',
              'A patient submitted an appointment request awaiting your confirmation.',
              action.appointment.id,
            );
          }),
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
          tap((action) =>
            this.emit(
              action.appointment.patientId,
              'cancellation',
              'Appointment cancelled',
              'Your appointment was cancelled.',
            ),
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
          tap((action) =>
            this.emit(
              action.appointment.patientId,
              'reschedule',
              'Appointment rescheduled',
              'Your appointment was moved to a new time.',
            ),
          ),
          catchError((error) =>
            of(A.rescheduleAppointmentFailure({ error: error.message })),
          ),
        ),
      ),
    ),
  );
}
