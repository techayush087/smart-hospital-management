import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { DoctorDetailComponent } from './doctor-detail.component';
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

describe('DoctorDetailComponent', () => {
  let fixture: ComponentFixture<DoctorDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorDetailComponent],
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
            snapshot: { paramMap: convertToParamMap({ id: 'd1' }) },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DoctorDetailComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads the doctor by route id and renders the profile', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/doctors/d1`);
    expect(req.request.method).toBe('GET');
    req.flush(makeDoctor());
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Dr. Alice Smith');
    expect(text).toContain('Cardiology');
  });
});
