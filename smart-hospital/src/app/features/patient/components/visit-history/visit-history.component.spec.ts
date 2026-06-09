import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { VisitHistoryComponent } from './visit-history.component';
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

  it('renders a row per visit', () => {
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/visits`,
    );
    req.flush([
      makeVisit({ id: 'v1', doctorName: 'Dr. Roy Patel' }),
      makeVisit({ id: 'v2', doctorName: 'Dr. Sarah Chen' }),
    ]);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.visit-table__row');
    expect(rows.length).toBe(2);

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Dr. Roy Patel');
    expect(text).toContain('Dr. Sarah Chen');
  });

  it('shows the empty state when there are no visits', () => {
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/visits`,
    );
    req.flush([]);
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('No visit history');
    const rows = fixture.nativeElement.querySelectorAll('.visit-table__row');
    expect(rows.length).toBe(0);
  });
});
