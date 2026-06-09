import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import {
  VisitRecord,
  Prescription,
  MedicalNote,
  TimelineEvent,
} from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class PatientRecordsService {
  private api = inject(ApiService);

  getVisitHistory(patientId: string): Observable<VisitRecord[]> {
    return this.api.get<VisitRecord[]>(
      '/visits',
      new HttpParams().set('patientId', patientId),
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

  getMedicalTimeline(patientId: string): Observable<TimelineEvent[]> {
    return this.getVisitHistory(patientId).pipe(
      map((visits) =>
        visits
          .slice()
          .sort(
            (a, b) =>
              new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(),
          )
          .map((v) => ({
            id: v.id,
            date: v.visitDate,
            doctorName: v.doctorName,
            specialization: v.specialization,
            title: v.summary.split('.')[0] || 'Visit',
            status: v.status,
          })),
      ),
    );
  }
}
