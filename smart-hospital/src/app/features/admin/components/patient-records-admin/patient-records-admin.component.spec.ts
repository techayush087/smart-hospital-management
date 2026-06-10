import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PatientRecordsAdminComponent } from './patient-records-admin.component';
import { environment } from '../../../../../environments/environment';
import { User } from '../../../../core/models';

const api = environment.apiUrl;

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'customer',
    dateOfBirth: '1990-05-12',
    phone: '+1-555-0100',
    bloodGroup: 'O+',
    allergies: [],
    existingConditions: [],
    avatar: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('PatientRecordsAdminComponent', () => {
  let fixture: ComponentFixture<PatientRecordsAdminComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientRecordsAdminComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientRecordsAdminComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushUsers(users: User[]): void {
    const req = httpMock.expectOne((r) => r.url === `${api}/users`);
    expect(req.request.params.get('role')).toBe('customer');
    req.flush(users);
    fixture.detectChanges();
  }

  it('renders the page header and a patient row per record', () => {
    flushUsers([
      makeUser({ id: 'u1', firstName: 'John', lastName: 'Doe' }),
      makeUser({ id: 'u2', firstName: 'Jane', lastName: 'Roe', email: 'jane.roe@example.com' }),
    ]);

    expect(fixture.nativeElement.querySelector('app-page-header')).not.toBeNull();
    const rows = fixture.nativeElement.querySelectorAll('[data-cy="patient-row"]');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('John Doe');
    expect(rows[1].textContent).toContain('Jane Roe');
  });

  it('shows an empty state when there are no records', () => {
    flushUsers([]);
    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[data-cy="patient-row"]').length).toBe(0);
  });

  it('issues a new request when the search filter changes', () => {
    flushUsers([makeUser({ id: 'u1' })]);

    // The search-bar debounces emissions; drive the handler directly so the test
    // stays deterministic in this zoneless environment (no fakeAsync/tick).
    fixture.componentInstance['onSearch']('jane');
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === `${api}/users`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('role')).toBe('customer');
    req.flush([makeUser({ id: 'u2', firstName: 'Jane', lastName: 'Roe' })]);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-cy="patient-row"]');
    expect(rows.length).toBe(1);
  });

  it('resolves the patient latest appointment and PATCHes its status', () => {
    flushUsers([makeUser({ id: 'u1' })]);

    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      '[data-cy="status-select"]',
    );
    select.value = 'completed';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    // First it looks up the patient's appointments...
    const lookup = httpMock.expectOne(
      (r) => r.url === `${api}/appointments` && r.params.get('patientId') === 'u1',
    );
    expect(lookup.request.method).toBe('GET');
    lookup.flush([
      { id: 'a9', patientId: 'u1', doctorId: 'd1', scheduledAt: '2026-06-15T10:00:00.000Z', duration: 30, type: 'in-person', status: 'confirmed', reason: 'x', createdAt: '', updatedAt: '' },
    ]);

    // ...then PATCHes the resolved appointment id (a9), not the user id.
    const patch = httpMock.expectOne(`${api}/appointments/a9`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body.status).toBe('completed');
    patch.flush({});

    // ...then notifies the patient (a persisted notification record).
    const notif = httpMock.expectOne(`${api}/notifications`);
    expect(notif.request.method).toBe('POST');
    expect(notif.request.body).toMatchObject({ userId: 'u1', type: 'admin-alert' });
    notif.flush({});
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-cy="status-updated"]'),
    ).not.toBeNull();
  });
});
