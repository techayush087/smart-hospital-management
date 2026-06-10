import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { VisitHistoryComponent } from './visit-history.component';
import { Appointment, Doctor } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

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
    reason: 'Follow-up consultation',
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

const authStub = {
  getCurrentUser: () => () => ({ id: 'u1', role: 'customer' }),
};

describe('VisitHistoryComponent', () => {
  let fixture: ComponentFixture<VisitHistoryComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitHistoryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitHistoryComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Visit history is now derived from the patient's COMPLETED appointments
  // (joined with /doctors for names) — not a separate /visits resource.
  function flush(appointments: Appointment[], doctors: Doctor[]): void {
    httpMock
      .expectOne((r) => r.url === `${api}/appointments` && r.params.get('patientId') === 'u1')
      .flush(appointments);
    httpMock.expectOne(`${api}/doctors`).flush(doctors);
    fixture.detectChanges();
  }

  it('renders a row per completed appointment', () => {
    flush(
      [
        makeAppointment({ id: 'a1', doctorId: 'd1', status: 'completed' }),
        makeAppointment({ id: 'a2', doctorId: 'd2', status: 'completed' }),
        // A non-completed appointment must NOT appear in history.
        makeAppointment({ id: 'a3', doctorId: 'd1', status: 'confirmed' }),
      ],
      [
        makeDoctor({ id: 'd1', name: 'Dr. Roy Patel' }),
        makeDoctor({ id: 'd2', name: 'Dr. Sarah Chen' }),
      ],
    );

    const rows = fixture.nativeElement.querySelectorAll('.visit-table__row');
    expect(rows.length).toBe(2);

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Dr. Roy Patel');
    expect(text).toContain('Dr. Sarah Chen');
  });

  it('shows the empty state when there are no completed appointments', () => {
    flush([makeAppointment({ status: 'pending' })], [makeDoctor()]);

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('No visit history');
    const rows = fixture.nativeElement.querySelectorAll('.visit-table__row');
    expect(rows.length).toBe(0);
  });
});
