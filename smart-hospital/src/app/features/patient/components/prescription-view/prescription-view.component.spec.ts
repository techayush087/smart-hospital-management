import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PrescriptionViewComponent } from './prescription-view.component';
import { Prescription } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

function makePrescription(overrides: Partial<Prescription> = {}): Prescription {
  return {
    id: 'rx1',
    appointmentId: 'a1',
    patientId: 'u1',
    medications: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '7 days',
      },
    ],
    instructions: 'Take after meals.',
    issuedAt: '2026-05-20T09:00:00.000Z',
    ...overrides,
  };
}

const authStub = {
  getCurrentUser: () => () => ({ id: 'u1', role: 'customer' }),
};

describe('PrescriptionViewComponent', () => {
  let fixture: ComponentFixture<PrescriptionViewComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionViewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PrescriptionViewComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('renders the medication name and dosage for each prescription', () => {
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/prescriptions`,
    );
    req.flush([makePrescription()]);
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Amoxicillin');
    expect(text).toContain('500mg');

    const cards = fixture.nativeElement.querySelectorAll('.prescription');
    expect(cards.length).toBe(1);
  });

  it('shows the empty state when there are no prescriptions', () => {
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/prescriptions`,
    );
    req.flush([]);
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('No prescriptions');
    const cards = fixture.nativeElement.querySelectorAll('.prescription');
    expect(cards.length).toBe(0);
  });
});
