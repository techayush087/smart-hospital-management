import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { environment } from '../../../../environments/environment';
import {
  Appointment,
  AppointmentSlot,
  Doctor,
  DoctorSchedule,
  User,
} from '../../../core/models';
import { toISODate } from '../../../shared/utils/date.utils';

const api = environment.apiUrl;

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'customer',
    dateOfBirth: '1990-05-12',
    phone: '+1-555-0100',
    bloodGroup: 'O+',
    allergies: [],
    existingConditions: [],
    avatar: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

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

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    patientId: 'u1',
    doctorId: 'd1',
    scheduledAt: '2026-06-09T09:00:00.000Z',
    duration: 30,
    type: 'in-person',
    status: 'pending',
    reason: 'Checkup',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeSchedule(overrides: Partial<DoctorSchedule> = {}): DoctorSchedule {
  return {
    id: 'sch1',
    doctorId: 'd1',
    doctorName: 'Dr. Alice Smith',
    weekday: 1,
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 30,
    isActive: true,
    ...overrides,
  };
}

function makeSlot(overrides: Partial<AppointmentSlot> = {}): AppointmentSlot {
  return {
    id: 's1',
    doctorId: 'd1',
    startTime: '2026-06-10T09:00:00.000Z',
    endTime: '2026-06-10T09:30:00.000Z',
    isAvailable: true,
    type: 'in-person',
    createdBy: 'admin1',
    ...overrides,
  };
}

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDoctorSchedules GETs /schedules', () => {
    const schedules = [makeSchedule()];
    let result: DoctorSchedule[] | undefined;
    service.getDoctorSchedules().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${api}/schedules`);
    expect(req.request.method).toBe('GET');
    req.flush(schedules);

    expect(result).toEqual(schedules);
  });

  it('updateDoctorSchedule PUTs /schedules/:id with the body', () => {
    const schedule = makeSchedule({ id: 'sch1', isActive: false });
    service.updateDoctorSchedule('sch1', schedule).subscribe();

    const req = httpMock.expectOne(`${api}/schedules/sch1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(schedule);
    req.flush(schedule);
  });

  it('createSlot POSTs /slots with the body', () => {
    const slot = makeSlot();
    service.createSlot(slot).subscribe();

    const req = httpMock.expectOne(`${api}/slots`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(slot);
    req.flush(slot);
  });

  it('deleteSlot DELETEs /slots/:id', () => {
    service.deleteSlot('s1').subscribe();

    const req = httpMock.expectOne(`${api}/slots/s1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getPatientRecords GETs /users?role=customer and maps to PatientRecord', () => {
    let records: import('../../../core/models').PatientRecord[] | undefined;
    service.getPatientRecords().subscribe((r) => (records = r));

    const req = httpMock.expectOne(`${api}/users?role=customer`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('role')).toBe('customer');
    req.flush([
      makeUser({ id: 'u1', firstName: 'John', lastName: 'Doe' }),
      makeUser({
        id: 'u2',
        firstName: 'Jane',
        lastName: 'Roe',
        email: 'jane.roe@example.com',
        existingConditions: ['Asthma'],
      }),
    ]);

    expect(records?.length).toBe(2);
    expect(records?.[0].fullName).toBe('John Doe');
    expect(records?.[1].fullName).toBe('Jane Roe');
    expect(records?.[1].activeConditions).toEqual(['Asthma']);
  });

  it('getPatientRecords applies the query filter', () => {
    let records: import('../../../core/models').PatientRecord[] | undefined;
    service.getPatientRecords({ query: 'jane' }).subscribe((r) => (records = r));

    const req = httpMock.expectOne(`${api}/users?role=customer`);
    req.flush([
      makeUser({ id: 'u1', firstName: 'John', lastName: 'Doe' }),
      makeUser({ id: 'u2', firstName: 'Jane', lastName: 'Roe' }),
    ]);

    expect(records?.length).toBe(1);
    expect(records?.[0].fullName).toBe('Jane Roe');
  });

  it('updateConsultationStatus PATCHes /appointments/:id with status', () => {
    service.updateConsultationStatus('a1', 'completed').subscribe();

    const req = httpMock.expectOne(`${api}/appointments/a1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.status).toBe('completed');
    expect(req.request.body.updatedAt).toBeDefined();
    req.flush(makeAppointment({ status: 'completed' }));
  });

  it('getDashboardStats issues 3 GETs and computes aggregate stats', () => {
    const today = toISODate(new Date());
    const appointments = [
      makeAppointment({
        id: 'a1',
        doctorId: 'd1',
        status: 'pending',
        scheduledAt: `${today}T09:00:00.000Z`,
      }),
      makeAppointment({
        id: 'a2',
        doctorId: 'd2',
        status: 'confirmed',
        scheduledAt: '2026-05-01T09:00:00.000Z',
      }),
    ];
    const users = [
      makeUser({ id: 'u1', role: 'customer' }),
      makeUser({ id: 'u2', role: 'admin' }),
    ];
    const doctors = [
      makeDoctor({ id: 'd1', specialization: 'Cardiology' }),
      makeDoctor({ id: 'd2', specialization: 'Dermatology' }),
    ];

    let stats: import('../../../core/models').DashboardStats | undefined;
    service.getDashboardStats().subscribe((s) => (stats = s));

    httpMock.expectOne(`${api}/appointments`).flush(appointments);
    httpMock.expectOne(`${api}/users`).flush(users);
    httpMock.expectOne(`${api}/doctors`).flush(doctors);

    expect(stats?.totalPatients).toBe(1);
    expect(stats?.doctorsAvailable).toBe(2);
    expect(stats?.todaysAppointments).toBe(1);
    expect(stats?.pendingActions).toBe(1);
    expect(stats?.appointmentsTrend.length).toBe(2);
    const trend = stats!.appointmentsTrend;
    expect(trend[0].date <= trend[1].date).toBe(true);
    expect(stats?.specialtyDistribution.length).toBe(2);
    const specs = stats?.specialtyDistribution.map((d) => d.specialization).sort();
    expect(specs).toEqual(['Cardiology', 'Dermatology']);
  });

  it('getAppointmentReport GETs /appointments and computes byStatus + total', () => {
    const range = { start: '2026-06-01T00:00:00.000Z', end: '2026-06-30T23:59:59.000Z' };
    const appointments = [
      makeAppointment({ id: 'a1', status: 'completed', scheduledAt: '2026-06-05T09:00:00.000Z' }),
      makeAppointment({ id: 'a2', status: 'completed', scheduledAt: '2026-06-10T09:00:00.000Z' }),
      makeAppointment({ id: 'a3', status: 'cancelled', scheduledAt: '2026-06-15T09:00:00.000Z' }),
      makeAppointment({ id: 'a4', status: 'pending', scheduledAt: '2026-07-01T09:00:00.000Z' }),
    ];

    let report: import('../../../core/models').ReportData | undefined;
    service.getAppointmentReport(range).subscribe((r) => (report = r));

    const req = httpMock.expectOne(`${api}/appointments`);
    expect(req.request.method).toBe('GET');
    req.flush(appointments);

    expect(report?.total).toBe(3);
    expect(report?.range).toEqual(range);
    const completed = report?.byStatus.find((b) => b.status === 'completed');
    const cancelled = report?.byStatus.find((b) => b.status === 'cancelled');
    expect(completed?.count).toBe(2);
    expect(cancelled?.count).toBe(1);
  });
});
