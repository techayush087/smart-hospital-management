import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PatientRecordsService } from './patient-records.service';
import {
  VisitRecord,
  Prescription,
  TimelineEvent,
} from '../../../core/models';
import { environment } from '../../../../environments/environment';

function makeVisit(overrides: Partial<VisitRecord> = {}): VisitRecord {
  return {
    id: 'v1',
    patientId: 'u1',
    doctorId: 'd1',
    doctorName: 'Dr. Roy Patel',
    specialization: 'General Medicine',
    visitDate: '2026-05-20T09:00:00.000Z',
    type: 'virtual',
    status: 'completed',
    summary: 'Follow-up; recovering well.',
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

  it('getVisitHistory(patientId) GETs /visits with patientId param', () => {
    service.getVisitHistory('u1').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/visits`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('patientId')).toBe('u1');
    req.flush([]);
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

  it('getMedicalTimeline(patientId) loads /visits and maps to TimelineEvent[] sorted desc', () => {
    let result: TimelineEvent[] | undefined;
    service.getMedicalTimeline('u1').subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/visits`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('patientId')).toBe('u1');

    const older = makeVisit({
      id: 'v1',
      visitDate: '2026-03-12T09:00:00.000Z',
      summary: 'Initial visit. Discussed symptoms.',
    });
    const newer = makeVisit({
      id: 'v2',
      visitDate: '2026-05-20T09:00:00.000Z',
      summary: 'Follow-up; recovering well.',
    });
    req.flush([older, newer]);

    expect(result?.length).toBe(2);
    // Sorted newest first
    expect(result?.[0].id).toBe('v2');
    expect(result?.[1].id).toBe('v1');
    // Mapping: date, title from first sentence of summary
    expect(result?.[0].date).toBe('2026-05-20T09:00:00.000Z');
    expect(result?.[0].title).toBe('Follow-up; recovering well');
    expect(result?.[1].title).toBe('Initial visit');
    expect(result?.[0].status).toBe('completed');
  });
});
