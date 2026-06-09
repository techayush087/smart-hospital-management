import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { MedicalTimelineComponent } from './medical-timeline.component';
import { VisitRecord } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

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

  it('renders an event per visit in date-descending order', () => {
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/visits`,
    );
    req.flush([
      makeVisit({
        id: 'v-older',
        doctorName: 'Dr. Older Visit',
        visitDate: '2026-01-10T09:00:00.000Z',
      }),
      makeVisit({
        id: 'v-newer',
        doctorName: 'Dr. Newer Visit',
        visitDate: '2026-05-20T09:00:00.000Z',
      }),
    ]);
    fixture.detectChanges();

    const events = fixture.nativeElement.querySelectorAll('.timeline-event');
    expect(events.length).toBe(2);

    const firstText: string = events[0].textContent;
    const secondText: string = events[1].textContent;
    expect(firstText).toContain('Dr. Newer Visit');
    expect(secondText).toContain('Dr. Older Visit');
  });

  it('shows the empty state when there is no history', () => {
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/visits`,
    );
    req.flush([]);
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('No medical history');
    const events = fixture.nativeElement.querySelectorAll('.timeline-event');
    expect(events.length).toBe(0);
  });
});
