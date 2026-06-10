import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { PatientDashboardComponent } from './patient-dashboard.component';
import { Appointment } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth.service';
import {
  appointmentAdapter,
  initialAppointmentCatalogState,
} from '../../../../store/appointment-catalog';
import { environment } from '../../../../../environments/environment';

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    patientId: 'u1',
    doctorId: 'd1',
    scheduledAt: '2030-07-01T10:00:00.000Z',
    duration: 30,
    type: 'in-person',
    status: 'confirmed',
    reason: 'Annual checkup',
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    ...overrides,
  };
}

const authStub = {
  getCurrentUser: () => () => ({ id: 'u1', role: 'customer' }),
};

describe('PatientDashboardComponent', () => {
  let fixture: ComponentFixture<PatientDashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const state = appointmentAdapter.setAll(
      [makeAppointment({ id: 'up1', reason: 'Upcoming visit' })],
      initialAppointmentCatalogState,
    );

    await TestBed.configureTestingModule({
      imports: [PatientDashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({ initialState: { appointmentCatalog: state } }),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDashboardComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushRecords(visits = 3, prescriptions = 2): void {
    // Visit history is derived from completed appointments + doctors.
    httpMock
      .expectOne((r) => r.url === `${environment.apiUrl}/appointments` && r.params.get('patientId') === 'u1')
      .flush(
        Array.from({ length: visits }, (_, i) => ({
          id: `a${i}`, patientId: 'u1', doctorId: 'd1',
          scheduledAt: '2026-05-20T09:00:00.000Z', duration: 30, type: 'virtual',
          status: 'completed', reason: 'Visit', createdAt: '', updatedAt: '',
        })),
      );
    httpMock
      .expectOne(`${environment.apiUrl}/doctors`)
      .flush([{ id: 'd1', name: 'Dr. Roy Patel', specialization: 'General Medicine', experience: 8, consultationType: 'both', location: 'NY', rating: 4.7, reviewCount: 1, bio: '', languages: [], consultationFee: 100 }]);
    httpMock
      .expectOne((r) => r.url === `${environment.apiUrl}/prescriptions` && r.params.get('patientId') === 'u1')
      .flush(Array.from({ length: prescriptions }, (_, i) => ({ id: `p${i}` })));
    fixture.detectChanges();
  }

  it('renders the stat strip + next appointment once records load', () => {
    flushRecords();
    const stats = fixture.nativeElement.querySelectorAll('.stat');
    expect(stats.length).toBe(3);

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Next appointment');
    expect(text).toContain('Total Visits');
    expect(text).toContain('Active Prescriptions');
    expect(text).toContain('Notifications');
  });

  it('shows visit count, prescription count and notification stat', () => {
    flushRecords(3, 2);
    const text: string = fixture.nativeElement.textContent;
    // Total visits = 3, Active prescriptions = 2
    expect(text).toContain('3');
    expect(text).toContain('2');

    const notifStat = fixture.nativeElement.querySelector(
      '[data-cy="notification-stat"]',
    );
    expect(notifStat).toBeTruthy();
    expect(notifStat.textContent.trim()).toBe('0');
  });

  it('renders the upcoming appointments and quick actions', () => {
    flushRecords();
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Upcoming appointments');
    expect(text).toContain('Book New');
    expect(text).toContain('Visit History');
    expect(text).toContain('Prescriptions');
  });
});
