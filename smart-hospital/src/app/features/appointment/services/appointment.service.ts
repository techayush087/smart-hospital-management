import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Appointment, BookingRequest, TimeSlot } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private api = inject(ApiService);

  getAppointments(patientId: string): Observable<Appointment[]> {
    return this.api.get<Appointment[]>(
      '/appointments',
      new HttpParams().set('patientId', patientId),
    );
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.api.get<Appointment>(`/appointments/${id}`);
  }

  bookAppointment(booking: BookingRequest): Observable<Appointment> {
    const now = new Date().toISOString();
    const payload: Partial<Appointment> = {
      patientId: booking.patientId,
      doctorId: booking.doctorId,
      scheduledAt: booking.scheduledAt,
      duration: booking.duration,
      type: booking.type,
      // New bookings start as a request awaiting admin confirmation.
      status: 'pending',
      reason: booking.reason,
      createdAt: now,
      updatedAt: now,
    };
    return this.api.post<Appointment>('/appointments', payload);
  }

  cancelAppointment(id: string): Observable<Appointment> {
    return this.api.patch<Appointment>(`/appointments/${id}`, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
  }

  rescheduleAppointment(id: string, newSlot: TimeSlot): Observable<Appointment> {
    return this.api.patch<Appointment>(`/appointments/${id}`, {
      scheduledAt: newSlot.startTime,
      status: 'rescheduled',
      updatedAt: new Date().toISOString(),
    });
  }
}
