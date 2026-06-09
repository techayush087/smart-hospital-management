import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Doctor, DoctorFilter, TimeSlot } from '../../../core/models';
import { filterDoctors } from '../../../shared/helpers/doctor.helpers';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private api = inject(ApiService);

  getDoctors(filters?: DoctorFilter): Observable<Doctor[]> {
    return this.api
      .get<Doctor[]>('/doctors')
      .pipe(map((list) => (filters ? filterDoctors(list, filters) : list)));
  }

  getDoctorById(id: string): Observable<Doctor> {
    return this.api.get<Doctor>(`/doctors/${id}`);
  }

  getAvailableSlots(doctorId: string, date: string): Observable<TimeSlot[]> {
    // json-server serves /slots?doctorId= (NOT /doctors/:id/slots). Use /slots directly.
    return this.api.get<TimeSlot[]>(
      '/slots',
      new HttpParams().set('doctorId', doctorId).set('date', date),
    );
  }

  searchDoctors(query: string): Observable<Doctor[]> {
    return this.getDoctors().pipe(
      map((list) =>
        list.filter(
          (d) =>
            d.name.toLowerCase().includes(query.toLowerCase()) ||
            d.specialization.toLowerCase().includes(query.toLowerCase()),
        ),
      ),
    );
  }
}
