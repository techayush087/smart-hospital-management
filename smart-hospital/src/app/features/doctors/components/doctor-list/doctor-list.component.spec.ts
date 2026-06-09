import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { DoctorListComponent } from './doctor-list.component';
import { Doctor } from '../../../../core/models';
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

describe('DoctorListComponent', () => {
  let fixture: ComponentFixture<DoctorListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DoctorListComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests /doctors on init and renders a card per doctor', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/doctors`);
    expect(req.request.method).toBe('GET');
    req.flush([
      makeDoctor({ id: 'd1' }),
      makeDoctor({ id: 'd2', name: 'Dr. Bob' }),
    ]);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-doctor-card');
    expect(cards.length).toBe(2);
  });

  it('shows the empty state when no doctors are returned', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/doctors`);
    req.flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-doctor-card').length).toBe(0);
  });
});
