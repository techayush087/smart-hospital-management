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

  it('PATCHes the appointment status when a row status select changes', () => {
    flushUsers([makeUser({ id: 'u1' })]);

    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      '[data-cy="status-select"]',
    );
    select.value = 'completed';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const req = httpMock.expectOne(`${api}/appointments/u1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.status).toBe('completed');
    req.flush({});
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-cy="status-updated"]'),
    ).not.toBeNull();
  });
});
