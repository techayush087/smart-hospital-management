import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import {
  Appointment,
  Doctor,
  VisitRecord,
  Prescription,
  MedicalNote,
  TimelineEvent,
} from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class PatientRecordsService {
  private api = inject(ApiService);

  /**
   * Visit history is derived from the patient's COMPLETED appointments (joined with
   * the doctor for names/specialization), so a real completed booking shows up here
   * automatically. No separate "visit" record is needed.
   */
  getVisitHistory(patientId: string): Observable<VisitRecord[]> {
    return forkJoin({
      appointments: this.api.get<Appointment[]>(
        '/appointments',
        new HttpParams().set('patientId', patientId),
      ),
      doctors: this.api.get<Doctor[]>('/doctors'),
    }).pipe(
      map(({ appointments, doctors }) =>
        appointments
          .filter((a) => a.status === 'completed')
          .sort(
            (a, b) =>
              new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
          )
          .map((a) => {
            const doctor = doctors.find((d) => d.id === a.doctorId);
            return {
              id: a.id,
              patientId: a.patientId,
              doctorId: a.doctorId,
              doctorName: doctor?.name ?? 'Unknown doctor',
              specialization: doctor?.specialization ?? '',
              visitDate: a.scheduledAt,
              type: a.type,
              status: a.status,
              summary: a.reason,
            } satisfies VisitRecord;
          }),
      ),
    );
  }

  getPrescriptions(patientId: string): Observable<Prescription[]> {
    return this.api.get<Prescription[]>(
      '/prescriptions',
      new HttpParams().set('patientId', patientId),
    );
  }

  getMedicalNotes(visitId: string): Observable<MedicalNote[]> {
    return this.api.get<MedicalNote[]>(
      '/medical-notes',
      new HttpParams().set('visitId', visitId),
    );
  }

  /**
   * The timeline merges completed visits AND prescriptions into one date-sorted feed,
   * so both kinds of medical history appear chronologically.
   */
  getMedicalTimeline(patientId: string): Observable<TimelineEvent[]> {
    return forkJoin({
      visits: this.getVisitHistory(patientId),
      prescriptions: this.getPrescriptions(patientId),
    }).pipe(
      map(({ visits, prescriptions }) => {
        const visitEvents: TimelineEvent[] = visits.map((v) => ({
          id: `visit-${v.id}`,
          date: v.visitDate,
          doctorName: v.doctorName,
          specialization: v.specialization,
          title: v.summary.split('.')[0] || 'Consultation',
          status: v.status,
        }));
        const rxEvents: TimelineEvent[] = prescriptions.map((p) => ({
          id: `rx-${p.id}`,
          date: p.issuedAt,
          doctorName: 'Prescription issued',
          specialization: '',
          title: 'Prescription',
          status: 'completed',
          prescriptionSummary: p.medications.map((m) => m.name).join(', '),
        }));
        return [...visitEvents, ...rxEvents].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      }),
    );
  }
}
