import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { MedicalTimelineComponent } from './medical-timeline.component';
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

function makeDoctor(id: string, name: string): Doctor {
  return {
    id, name, specialization: 'General Medicine', experience: 8,
    consultationType: 'both', location: 'NY', rating: 4.7, reviewCount: 1,
    bio: '', languages: [], consultationFee: 100,
  };
}

const authStub = {
  getCurrentUser: () => () => ({ id: 'u1', role: 'customer' }),
};

describe('MedicalTimelineComponent', () => {
  let fixture: ComponentFixture<MedicalTimelineComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalTimelineComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalTimelineComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Timeline forkJoins visit history (completed appointments + doctors) + prescriptions.
  function flush(
    appointments: Appointment[],
    doctors: Doctor[],
    prescriptions: unknown[] = [],
  ): void {
    httpMock
      .expectOne((r) => r.url === `${api}/appointments` && r.params.get('patientId') === 'u1')
      .flush(appointments);
    httpMock.expectOne(`${api}/doctors`).flush(doctors);
    httpMock
      .expectOne((r) => r.url === `${api}/prescriptions` && r.params.get('patientId') === 'u1')
      .flush(prescriptions);
    fixture.detectChanges();
  }

  it('renders an event per completed visit in date-descending order', () => {
    flush(
      [
        makeAppointment({ id: 'a-older', doctorId: 'd1', scheduledAt: '2026-01-10T09:00:00.000Z', status: 'completed' }),
        makeAppointment({ id: 'a-newer', doctorId: 'd2', scheduledAt: '2026-05-20T09:00:00.000Z', status: 'completed' }),
      ],
      [makeDoctor('d1', 'Dr. Older Visit'), makeDoctor('d2', 'Dr. Newer Visit')],
    );

    const events = fixture.nativeElement.querySelectorAll('.timeline-event');
    expect(events.length).toBe(2);
    expect(events[0].textContent).toContain('Dr. Newer Visit');
    expect(events[1].textContent).toContain('Dr. Older Visit');
  });

  it('shows the empty state when there is no history', () => {
    flush([], []);

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('No medical history');
    const events = fixture.nativeElement.querySelectorAll('.timeline-event');
    expect(events.length).toBe(0);
  });
});
