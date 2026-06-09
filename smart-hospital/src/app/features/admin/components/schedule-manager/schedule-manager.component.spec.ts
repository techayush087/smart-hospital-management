import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ScheduleManagerComponent } from './schedule-manager.component';
import { environment } from '../../../../../environments/environment';
import { Doctor, TimeSlot } from '../../../../core/models';

const api = environment.apiUrl;

function makeDoctor(overrides: Partial<Doctor> = {}): Doctor {
  return {
    id: 'd1',
    name: 'Dr. Alice Smith',
    specialization: 'Cardiology',
    experience: 10,
    consultationType: 'both',
    location: 'New York',
    rating: 4.5,
    reviewCount: 120,
    bio: 'Experienced cardiologist.',
    languages: ['English'],
    consultationFee: 200,
    ...overrides,
  };
}

function makeSlot(overrides: Partial<TimeSlot> = {}): TimeSlot {
  return {
    id: 's1',
    doctorId: 'd1',
    startTime: '2026-06-10T09:00:00',
    endTime: '2026-06-10T09:30:00',
    isAvailable: true,
    type: 'in-person',
    ...overrides,
  };
}

describe('ScheduleManagerComponent', () => {
  let fixture: ComponentFixture<ScheduleManagerComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleManagerComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleManagerComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushDoctors(): void {
    httpMock
      .expectOne(`${api}/doctors`)
      .flush([makeDoctor({ id: 'd1' }), makeDoctor({ id: 'd2', name: 'Dr. Bob Jones' })]);
    fixture.detectChanges();
  }

  function selectDoctorAndDate(): void {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      '[data-cy="doctor-select"]',
    );
    select.value = 'd1';
    select.dispatchEvent(new Event('change'));

    const dateInput: HTMLInputElement = fixture.nativeElement.querySelector(
      '[data-cy="date-input"]',
    );
    dateInput.value = '2026-06-10';
    dateInput.dispatchEvent(new Event('input'));

    fixture.detectChanges();
  }

  function flushSlots(slots: TimeSlot[]): void {
    const reqs = httpMock.match((r) => r.url === `${api}/slots`);
    // The last /slots GET reflects the latest doctor+date selection.
    reqs[reqs.length - 1].flush(slots);
    fixture.detectChanges();
  }

  it('renders the page header and add-slot button', () => {
    flushDoctors();
    expect(fixture.nativeElement.querySelector('app-page-header')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-cy="add-slot"]')).not.toBeNull();
  });

  it('loads doctors into the selector', () => {
    flushDoctors();
    const options = fixture.nativeElement.querySelectorAll('[data-cy="doctor-select"] option');
    // Placeholder + 2 doctors.
    expect(options.length).toBe(3);
  });

  it('lists slots for a selected doctor and date with a delete button', () => {
    flushDoctors();
    selectDoctorAndDate();
    flushSlots([makeSlot({ id: 's1' })]);

    const rows = fixture.nativeElement.querySelectorAll('[data-cy="slot-row"]');
    expect(rows.length).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-cy="delete-slot"]')).not.toBeNull();
  });

  it('shows an empty state when there are no slots', () => {
    flushDoctors();
    selectDoctorAndDate();
    flushSlots([]);

    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[data-cy="slot-row"]').length).toBe(0);
  });

  it('POSTs a new slot to /slots when adding with valid inputs', () => {
    flushDoctors();
    selectDoctorAndDate();
    flushSlots([]);

    const start: HTMLInputElement = fixture.nativeElement.querySelector(
      '[data-cy="slot-start"]',
    );
    start.value = '10:00';
    start.dispatchEvent(new Event('input'));

    const end: HTMLInputElement = fixture.nativeElement.querySelector('[data-cy="slot-end"]');
    end.value = '10:30';
    end.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="add-slot"] button',
    );
    button.click();
    fixture.detectChanges();

    const post = httpMock.expectOne(`${api}/slots`);
    expect(post.request.method).toBe('POST');
    post.flush(makeSlot({ id: 's-new', startTime: '2026-06-10T10:00:00' }));

    // The list reloads after a successful create.
    flushSlots([makeSlot({ id: 's-new' })]);
    expect(fixture.nativeElement.querySelectorAll('[data-cy="slot-row"]').length).toBe(1);
  });

  it('opens a confirmation modal and DELETEs the slot on confirm', () => {
    flushDoctors();
    selectDoctorAndDate();
    flushSlots([makeSlot({ id: 's1' })]);

    const del: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="delete-slot"] button',
    );
    del.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-cy="confirm-delete-slot"]')).not.toBeNull();

    const confirm: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="confirm-delete-slot"] button',
    );
    confirm.click();
    fixture.detectChanges();

    const delReq = httpMock.expectOne(`${api}/slots/s1`);
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush(null);

    flushSlots([]);
    expect(fixture.nativeElement.querySelectorAll('[data-cy="slot-row"]').length).toBe(0);
  });
});
