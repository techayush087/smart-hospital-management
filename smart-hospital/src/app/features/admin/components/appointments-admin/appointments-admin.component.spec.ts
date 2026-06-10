import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AppointmentsAdminComponent } from './appointments-admin.component';
import { environment } from '../../../../../environments/environment';

const api = environment.apiUrl;

describe('AppointmentsAdminComponent', () => {
  let fixture: ComponentFixture<AppointmentsAdminComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsAdminComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(AppointmentsAdminComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function flushData(): void {
    httpMock.expectOne(`${api}/appointments`).flush([
      { id: 'a1', patientId: 'u1', doctorId: 'd1', scheduledAt: '2026-06-15T10:00:00.000Z', duration: 30, type: 'in-person', status: 'confirmed', reason: 'Checkup', createdAt: '', updatedAt: '' },
    ]);
    httpMock.expectOne(`${api}/users`).flush([
      { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'j@test.com', role: 'customer', dateOfBirth: '', phone: '', createdAt: '' },
    ]);
    httpMock.expectOne(`${api}/doctors`).flush([
      { id: 'd1', name: 'Dr. Sarah Chen', specialization: 'Cardiology', experience: 10, consultationType: 'both', location: 'NY', rating: 4.9, reviewCount: 1, bio: '', languages: [], consultationFee: 100 },
    ]);
    fixture.detectChanges();
  }

  it('lists all bookings with patient + doctor names', () => {
    flushData();
    const rows = fixture.nativeElement.querySelectorAll('[data-cy="appt-row"]');
    expect(rows.length).toBe(1);
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('John Doe');
    expect(text).toContain('Dr. Sarah Chen');
  });

  it('updates status and notifies the patient', () => {
    flushData();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('[data-cy="appt-status"]');
    select.value = 'completed';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const patch = httpMock.expectOne(`${api}/appointments/a1`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body.status).toBe('completed');
    patch.flush({});

    const notif = httpMock.expectOne(`${api}/notifications`);
    expect(notif.request.method).toBe('POST');
    expect(notif.request.body).toMatchObject({ userId: 'u1', type: 'admin-alert' });
    notif.flush({});
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-cy="appt-updated"]')).not.toBeNull();
  });

  it('navigates to the prescription editor pre-filled with the patient', () => {
    flushData();
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.nativeElement.querySelector('[data-cy="appt-prescribe"]').click();
    expect(navSpy).toHaveBeenCalledWith(['/admin/prescriptions'], {
      queryParams: { patientId: 'u1', appointmentId: 'a1' },
    });
  });
});
