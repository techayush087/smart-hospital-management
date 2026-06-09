import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { environment } from '../../../../../environments/environment';
import { Appointment, Doctor, User } from '../../../../core/models';
import { toISODate } from '../../../../shared/utils/date.utils';

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

describe('AdminDashboardComponent', () => {
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('renders 4 KPI cards with computed numbers and both charts', () => {
    const today = toISODate(new Date());

    httpMock.expectOne(`${api}/appointments`).flush([
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
    ]);
    httpMock.expectOne(`${api}/users`).flush([
      makeUser({ id: 'u1', role: 'customer' }),
      makeUser({ id: 'u2', role: 'customer' }),
      makeUser({ id: 'u3', role: 'admin' }),
    ]);
    httpMock.expectOne(`${api}/doctors`).flush([
      makeDoctor({ id: 'd1', specialization: 'Cardiology' }),
      makeDoctor({ id: 'd2', specialization: 'Dermatology' }),
    ]);

    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.kpi');
    expect(cards.length).toBe(4);

    const today$ = fixture.nativeElement.querySelector('[data-cy="kpi-today"]');
    const patients = fixture.nativeElement.querySelector(
      '[data-cy="kpi-patients"]',
    );
    const pending = fixture.nativeElement.querySelector(
      '[data-cy="kpi-pending"]',
    );
    const doctors = fixture.nativeElement.querySelector(
      '[data-cy="kpi-doctors"]',
    );

    expect(today$.textContent).toContain('1');
    expect(today$.textContent).toContain("Today's Appointments");
    expect(patients.textContent).toContain('2');
    expect(pending.textContent).toContain('1');
    expect(doctors.textContent).toContain('2');

    expect(fixture.nativeElement.querySelector('app-line-chart')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('app-donut-chart'),
    ).not.toBeNull();
  });
});
