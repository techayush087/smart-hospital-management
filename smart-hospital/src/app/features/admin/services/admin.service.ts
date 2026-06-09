import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import {
  DoctorSchedule,
  AppointmentSlot,
  PatientRecord,
  PatientFilter,
  ConsultationStatus,
  DashboardStats,
  ReportData,
  DateRange,
  Appointment,
  User,
  Doctor,
} from '../../../core/models';
import { toISODate } from '../../../shared/utils/date.utils';
import { groupBy } from '../../../shared/utils/array.utils';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);

  getDoctorSchedules(): Observable<DoctorSchedule[]> {
    return this.api.get<DoctorSchedule[]>('/schedules');
  }

  updateDoctorSchedule(id: string, s: DoctorSchedule): Observable<DoctorSchedule> {
    return this.api.put<DoctorSchedule>(`/schedules/${id}`, s);
  }

  createSlot(slot: AppointmentSlot): Observable<AppointmentSlot> {
    return this.api.post<AppointmentSlot>('/slots', slot);
  }

  deleteSlot(slotId: string): Observable<void> {
    return this.api.delete<void>(`/slots/${slotId}`);
  }

  getPatientRecords(filters?: PatientFilter): Observable<PatientRecord[]> {
    return this.api
      .get<User[]>('/users', new HttpParams().set('role', 'customer'))
      .pipe(
        map((users) =>
          users
            .map<PatientRecord>((u) => ({
              id: u.id,
              fullName: `${u.firstName} ${u.lastName}`,
              email: u.email,
              phone: u.phone,
              dateOfBirth: u.dateOfBirth,
              bloodGroup: u.bloodGroup,
              totalVisits: 0,
              activeConditions: u.existingConditions ?? [],
            }))
            .filter(
              (p) =>
                (!filters?.query ||
                  p.fullName.toLowerCase().includes(filters.query.toLowerCase()) ||
                  p.email.includes(filters.query)) &&
                (!filters?.bloodGroup || p.bloodGroup === filters.bloodGroup) &&
                (!filters?.hasActiveConditions || p.activeConditions.length > 0),
            ),
        ),
      );
  }

  updateConsultationStatus(id: string, status: ConsultationStatus): Observable<Appointment> {
    return this.api.patch<Appointment>(`/appointments/${id}`, {
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      appointments: this.api.get<Appointment[]>('/appointments'),
      users: this.api.get<User[]>('/users'),
      doctors: this.api.get<Doctor[]>('/doctors'),
    }).pipe(
      map(({ appointments, users, doctors }) => {
        const today = toISODate(new Date());
        const byDate = groupBy(
          appointments.map((a) => ({ ...a, day: toISODate(new Date(a.scheduledAt)) })),
          'day',
        );
        const bySpec = groupBy(
          appointments.map((a) => ({
            spec: doctors.find((d) => d.id === a.doctorId)?.specialization ?? 'Other',
          })),
          'spec',
        );
        return {
          todaysAppointments: appointments.filter(
            (a) => toISODate(new Date(a.scheduledAt)) === today,
          ).length,
          totalPatients: users.filter((u) => u.role === 'customer').length,
          pendingActions: appointments.filter((a) => a.status === 'pending').length,
          doctorsAvailable: doctors.length,
          appointmentsTrend: Object.entries(byDate)
            .map(([date, list]) => ({ date, count: list.length }))
            .sort((a, b) => a.date.localeCompare(b.date)),
          specialtyDistribution: Object.entries(bySpec).map(([specialization, list]) => ({
            specialization,
            count: list.length,
          })),
        };
      }),
    );
  }

  getAppointmentReport(range: DateRange): Observable<ReportData> {
    return this.api.get<Appointment[]>('/appointments').pipe(
      map((appointments) => {
        const inRange = appointments.filter(
          (a) => a.scheduledAt >= range.start && a.scheduledAt <= range.end,
        );
        const byStatus = groupBy(inRange, 'status');
        return {
          range,
          byStatus: Object.entries(byStatus).map(([status, list]) => ({
            status: status as Appointment['status'],
            count: list.length,
          })),
          total: inRange.length,
        };
      }),
    );
  }
}
