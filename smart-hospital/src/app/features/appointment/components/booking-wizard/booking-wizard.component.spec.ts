import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { BookingWizardComponent } from './booking-wizard.component';
import { Doctor } from '../../../../core/models';
import { initialAppointmentCatalogState } from '../../../../store/appointment-catalog';
import { environment } from '../../../../../environments/environment';

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

describe('BookingWizardComponent', () => {
  let fixture: ComponentFixture<BookingWizardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingWizardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          initialState: { appointmentCatalog: initialAppointmentCatalogState },
        }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ docId: 'd1' }) },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BookingWizardComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushDoctor(): void {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/doctors/d1`);
    expect(req.request.method).toBe('GET');
    req.flush(makeDoctor());
    fixture.detectChanges();
  }

  it('renders the wizard root, stepper, and starts on step 1', () => {
    flushDoctor();

    const root = fixture.nativeElement.querySelector(
      '[data-cy="booking-wizard"]',
    );
    expect(root).toBeTruthy();

    const steps = fixture.nativeElement.querySelectorAll('.booking-wizard__step');
    expect(steps.length).toBe(3);

    expect(fixture.componentInstance['currentStep']()).toBe(1);
    expect(
      fixture.nativeElement.querySelector('[data-cy="step-select-slot"]'),
    ).toBeTruthy();
  });

  it('does not advance past step 1 when no slot is selected', () => {
    flushDoctor();

    const cmp = fixture.componentInstance;
    expect(cmp.canAdvance()).toBe(false);

    cmp.next();
    fixture.detectChanges();

    expect(cmp['currentStep']()).toBe(1);
    expect(
      fixture.nativeElement.querySelector('[data-cy="step-select-slot"]'),
    ).toBeTruthy();
  });
});
