import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { environment } from '../../../../../environments/environment';
import { Appointment } from '../../../../core/models';

const api = environment.apiUrl;

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

describe('ReportsComponent', () => {
  let fixture: ComponentFixture<ReportsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('applies the range and renders the report total and status counts', () => {
    const component = fixture.componentInstance as unknown as {
      start: { set: (v: string) => void };
      end: { set: (v: string) => void };
    };
    component.start.set('2026-06-01');
    component.end.set('2026-06-30');
    fixture.detectChanges();

    const applyBtn: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="report-range-apply"] button',
    );
    applyBtn.click();

    const req = httpMock.expectOne(`${api}/appointments`);
    expect(req.request.method).toBe('GET');
    req.flush([
      makeAppointment({
        id: 'a1',
        status: 'completed',
        scheduledAt: '2026-06-05T09:00:00.000Z',
      }),
      makeAppointment({
        id: 'a2',
        status: 'completed',
        scheduledAt: '2026-06-10T09:00:00.000Z',
      }),
      makeAppointment({
        id: 'a3',
        status: 'cancelled',
        scheduledAt: '2026-06-15T09:00:00.000Z',
      }),
      makeAppointment({
        id: 'a4',
        status: 'pending',
        scheduledAt: '2026-07-15T09:00:00.000Z',
      }),
    ]);

    fixture.detectChanges();

    const total: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="report-total"]',
    );
    expect(total.textContent).toContain('3');

    const completedRow: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="report-status-completed"]',
    );
    expect(completedRow).not.toBeNull();
    expect(completedRow.textContent).toContain('2');
    expect(completedRow.textContent).toContain('Completed');

    const cancelledRow: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="report-status-cancelled"]',
    );
    expect(cancelledRow.textContent).toContain('1');
  });
});
