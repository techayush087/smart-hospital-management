import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DoctorService } from './doctor.service';
import { Doctor } from '../../../core/models';
import { environment } from '../../../../environments/environment';

function makeDoctor(overrides: Partial<Doctor> = {}): Doctor {
  return {
    id: 'd1',
    name: 'Dr. Alice Smith',
    specialization: 'Cardiology',
    experience: 10,
    consultationType: 'both',
    location: 'New York',
    rating: 4.5,
    reviewCount: 120,
    bio: 'Experienced cardiologist.',
    languages: ['English'],
    consultationFee: 200,
    ...overrides,
  };
}

describe('DoctorService', () => {
  let service: DoctorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DoctorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DoctorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDoctors() GETs /doctors and returns the list', () => {
    const doctors = [makeDoctor(), makeDoctor({ id: 'd2', name: 'Dr. Bob' })];
    let result: Doctor[] | undefined;
    service.getDoctors().subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/doctors`);
    expect(req.request.method).toBe('GET');
    req.flush(doctors);

    expect(result).toEqual(doctors);
    expect(result?.length).toBe(2);
  });

  it('getDoctors(filters) applies filterDoctors to the response', () => {
    const doctors = [
      makeDoctor({ id: 'd1', specialization: 'Cardiology' }),
      makeDoctor({ id: 'd2', specialization: 'Dermatology' }),
    ];
    let result: Doctor[] | undefined;
    service
      .getDoctors({ specialization: 'Cardiology' })
      .subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/doctors`);
    expect(req.request.method).toBe('GET');
    req.flush(doctors);

    expect(result?.length).toBe(1);
    expect(result?.[0].id).toBe('d1');
  });

  it('getDoctorById(id) GETs /doctors/:id', () => {
    const doctor = makeDoctor({ id: 'd1' });
    let result: Doctor | undefined;
    service.getDoctorById('d1').subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/doctors/d1`);
    expect(req.request.method).toBe('GET');
    req.flush(doctor);

    expect(result).toEqual(doctor);
  });

  it('getAvailableSlots(doctorId, date) GETs /slots with doctorId and date params', () => {
    service.getAvailableSlots('d1', '2026-06-10').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/slots`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('doctorId')).toBe('d1');
    expect(req.request.params.get('date')).toBe('2026-06-10');
    req.flush([]);
  });

  it('searchDoctors(query) GETs /doctors and filters by name/specialization', () => {
    const doctors = [
      makeDoctor({ id: 'd1', name: 'Dr. Chen', specialization: 'Cardiology' }),
      makeDoctor({ id: 'd2', name: 'Dr. Bob', specialization: 'Dermatology' }),
    ];
    let result: Doctor[] | undefined;
    service.searchDoctors('chen').subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/doctors`);
    expect(req.request.method).toBe('GET');
    req.flush(doctors);

    expect(result?.length).toBe(1);
    expect(result?.[0].id).toBe('d1');
  });
});
