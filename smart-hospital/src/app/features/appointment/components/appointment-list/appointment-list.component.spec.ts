import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { vi } from 'vitest';
import { AppointmentListComponent } from './appointment-list.component';
import { Appointment } from '../../../../core/models';
import {
  appointmentAdapter,
  cancelAppointment,
  initialAppointmentCatalogState,
} from '../../../../store/appointment-catalog';

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    patientId: 'p1',
    doctorId: 'd1',
    scheduledAt: '2026-07-01T10:00:00.000Z',
    duration: 30,
    type: 'in-person',
    status: 'confirmed',
    reason: 'Annual checkup',
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('AppointmentListComponent', () => {
  let fixture: ComponentFixture<AppointmentListComponent>;
  let store: MockStore;
  let httpMock: HttpTestingController;

  const upcoming = makeAppointment({
    id: 'up1',
    scheduledAt: '2026-07-01T10:00:00.000Z',
    status: 'confirmed',
    reason: 'Upcoming visit',
  });
  const past = makeAppointment({
    id: 'past1',
    scheduledAt: '2026-01-01T10:00:00.000Z',
    status: 'completed',
    reason: 'Past visit',
  });

  beforeEach(async () => {
    const state = appointmentAdapter.setAll(
      [upcoming, past],
      initialAppointmentCatalogState,
    );

    await TestBed.configureTestingModule({
      imports: [AppointmentListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          initialState: { appointmentCatalog: state },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentListComponent);
    store = TestBed.inject(MockStore);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('renders an upcoming and a past appointment', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Upcoming');
    expect(text).toContain('Upcoming visit');
    expect(text).toContain('Past');
    expect(text).toContain('Past visit');
  });

  it('dispatches cancelAppointment when Cancel is clicked', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const cancelBtn: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="cancel-appointment"] button',
    );
    cancelBtn.click();

    expect(dispatch).toHaveBeenCalledWith(
      cancelAppointment({ appointmentId: 'up1' }),
    );
  });

  afterEach(() => {
    httpMock.verify();
  });
});
