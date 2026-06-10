import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { Appointment, BookingRequest, TimeSlot } from '../../../core/models';
import { environment } from '../../../../environments/environment';

function makeBooking(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    doctorId: 'd1',
    slotId: 's1',
    patientId: 'u1',
    scheduledAt: '2026-06-10T09:00:00.000Z',
    duration: 30,
    type: 'in-person',
    reason: 'Routine checkup',
    consultationType: 'in-person',
    urgency: 'routine',
    ...overrides,
  };
}

function makeSlot(overrides: Partial<TimeSlot> = {}): TimeSlot {
  return {
    id: 's2',
    doctorId: 'd1',
    startTime: '2026-06-11T10:00:00.000Z',
    endTime: '2026-06-11T10:30:00.000Z',
    isAvailable: true,
    type: 'in-person',
    ...overrides,
  };
}

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppointmentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAppointments(patientId) GETs /appointments with patientId param', () => {
    service.getAppointments('u1').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/appointments`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('patientId')).toBe('u1');
    req.flush([]);
  });

  it('getAppointmentById(id) GETs /appointments/:id', () => {
    let result: Appointment | undefined;
    service.getAppointmentById('a1').subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/appointments/a1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'a1' } as Appointment);

    expect(result?.id).toBe('a1');
  });

  it('bookAppointment(booking) POSTs /appointments with confirmed status and booking fields', () => {
    const booking = makeBooking({
      doctorId: 'd99',
      patientId: 'u42',
      reason: 'Severe headache',
    });
    service.bookAppointment(booking).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/appointments`);
    expect(req.request.method).toBe('POST');
    const body = req.request.body;
    // New bookings are 'pending' until an admin confirms.
    expect(body.status).toBe('pending');
    expect(body.doctorId).toBe('d99');
    expect(body.patientId).toBe('u42');
    expect(body.reason).toBe('Severe headache');
    expect(body.scheduledAt).toBe(booking.scheduledAt);
    expect(body.duration).toBe(booking.duration);
    expect(body.type).toBe(booking.type);
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();
    req.flush({ id: 'a1' } as Appointment);
  });

  it('cancelAppointment(id) PATCHes /appointments/:id with cancelled status', () => {
    service.cancelAppointment('a1').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/appointments/a1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.status).toBe('cancelled');
    expect(req.request.body.updatedAt).toBeTruthy();
    req.flush({ id: 'a1', status: 'cancelled' } as Appointment);
  });

  it('rescheduleAppointment(id, slot) PATCHes /appointments/:id with new time and rescheduled status', () => {
    const slot = makeSlot({ startTime: '2026-06-12T14:00:00.000Z' });
    service.rescheduleAppointment('a1', slot).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/appointments/a1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.scheduledAt).toBe('2026-06-12T14:00:00.000Z');
    expect(req.request.body.status).toBe('rescheduled');
    expect(req.request.body.updatedAt).toBeTruthy();
    req.flush({ id: 'a1', status: 'rescheduled' } as Appointment);
  });
});
