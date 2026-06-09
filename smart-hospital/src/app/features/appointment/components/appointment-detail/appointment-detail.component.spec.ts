import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { AppointmentDetailComponent } from './appointment-detail.component';
import { Appointment } from '../../../../core/models';
import {
  appointmentAdapter,
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

describe('AppointmentDetailComponent', () => {
  let fixture: ComponentFixture<AppointmentDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const state = appointmentAdapter.setAll(
      [makeAppointment()],
      initialAppointmentCatalogState,
    );

    await TestBed.configureTestingModule({
      imports: [AppointmentDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          initialState: { appointmentCatalog: state },
        }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: 'a1' }) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentDetailComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('renders the appointment reason and status', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Annual checkup');
    expect(text).toContain('Confirmed');
  });
});
