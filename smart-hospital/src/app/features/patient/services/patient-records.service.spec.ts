import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PatientRecordsService } from './patient-records.service';
import {
  Appointment,
  Doctor,
  Prescription,
  TimelineEvent,
} from '../../../core/models';
import { environment } from '../../../../environments/environment';

const api = environment.apiUrl;

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    patientId: 'u1',
    doctorId: 'd1',
    scheduledAt: '2026-05-20T09:00:00.000Z',
    duration: 30,
    type: 'virtual',
    status: 'completed',
    reason: 'Follow-up; recovering well.',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function makeDoctor(overrides: Partial<Doctor> = {}): Doctor {
  return {
    id: 'd1',
    name: 'Dr. Roy Patel',
    specialization: 'General Medicine',
    experience: 8,
    consultationType: 'both',
    location: 'NY',
    rating: 4.7,
    reviewCount: 1,
    bio: '',
    languages: [],
    consultationFee: 100,
    ...overrides,
  };
}

describe('PatientRecordsService', () => {
  let service: PatientRecordsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PatientRecordsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PatientRecordsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getVisitHistory derives completed appointments from /appointments + /doctors', () => {
    let result: { id: string; doctorName: string }[] | undefined;
    service.getVisitHistory('u1').subscribe((r) => (result = r));

    httpMock
      .expectOne((r) => r.url === `${api}/appointments` && r.params.get('patientId') === 'u1')
      .flush([
        makeAppointment({ id: 'a1', doctorId: 'd1', status: 'completed' }),
        makeAppointment({ id: 'a2', doctorId: 'd1', status: 'confirmed' }), // excluded
      ]);
    httpMock.expectOne(`${api}/doctors`).flush([makeDoctor({ id: 'd1', name: 'Dr. Roy Patel' })]);

    // Only the completed appointment becomes a visit.
    expect(result?.length).toBe(1);
    expect(result?.[0].doctorName).toBe('Dr. Roy Patel');
  });

  it('getPrescriptions(patientId) GETs /prescriptions with patientId param', () => {
    service.getPrescriptions('u1').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/prescriptions`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('patientId')).toBe('u1');
    req.flush([] as Prescription[]);
  });

  it('getMedicalNotes(visitId) GETs /medical-notes with visitId param', () => {
    service.getMedicalNotes('v1').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/medical-notes`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('visitId')).toBe('v1');
    req.flush([]);
  });

  it('getMedicalTimeline merges completed visits + prescriptions, sorted newest first', () => {
    let result: TimelineEvent[] | undefined;
    service.getMedicalTimeline('u1').subscribe((res) => (result = res));

    // Timeline forkJoins visit history (appointments + doctors) and prescriptions.
    httpMock
      .expectOne((r) => r.url === `${api}/appointments` && r.params.get('patientId') === 'u1')
      .flush([
        makeAppointment({ id: 'a1', scheduledAt: '2026-03-12T09:00:00.000Z', status: 'completed', reason: 'Initial visit. Discussed symptoms.' }),
      ]);
    httpMock.expectOne(`${api}/doctors`).flush([makeDoctor({ id: 'd1', name: 'Dr. Roy Patel' })]);
    httpMock
      .expectOne((r) => r.url === `${api}/prescriptions` && r.params.get('patientId') === 'u1')
      .flush([
        { id: 'p1', appointmentId: 'a1', patientId: 'u1', issuedAt: '2026-05-20T09:00:00.000Z', instructions: '', medications: [{ name: 'Metoprolol', dosage: '25mg', frequency: 'Daily', duration: '30d' }] } as Prescription,
      ]);

    expect(result?.length).toBe(2);
    // Newest first: the prescription (May) before the visit (March).
    expect(result?.[0].id).toBe('rx-p1');
    expect(result?.[0].prescriptionSummary).toBe('Metoprolol');
    expect(result?.[1].id).toBe('visit-a1');
    expect(result?.[1].title).toBe('Initial visit');
  });
});
