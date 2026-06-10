import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PrescriptionEditorComponent } from './prescription-editor.component';
import { environment } from '../../../../../environments/environment';

describe('PrescriptionEditorComponent', () => {
  let fixture: ComponentFixture<PrescriptionEditorComponent>;
  let httpMock: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionEditorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(PrescriptionEditorComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // On init it loads patients (GET /users?role=customer) and doctors (GET /doctors).
    httpMock
      .expectOne((r) => r.url === `${api}/users` && r.params.get('role') === 'customer')
      .flush([
        { id: 'u1', firstName: 'John', lastName: 'Doe', email: 'p@test.com', role: 'customer', dateOfBirth: '1990-01-01', phone: '1', createdAt: '' },
      ]);
    httpMock.expectOne(`${api}/doctors`).flush([
      { id: 'd1', name: 'Dr. Sarah Chen', specialization: 'Cardiology', experience: 10, consultationType: 'both', location: 'NY', rating: 4.9, reviewCount: 1, bio: '', languages: [], consultationFee: 100 },
    ]);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('starts with one medication row and an invalid form', () => {
    expect(fixture.componentInstance.medications.length).toBe(1);
    expect((fixture.componentInstance as any).form.invalid).toBe(true);
  });

  it('adds and removes medication rows', () => {
    const c = fixture.componentInstance;
    c.addMedication();
    expect(c.medications.length).toBe(2);
    c.removeMedication(1);
    expect(c.medications.length).toBe(1);
    // Never drops below one row.
    c.removeMedication(0);
    expect(c.medications.length).toBe(1);
  });

  it('creates the prescription then notifies the patient', () => {
    const c = fixture.componentInstance;
    (c as any).form.patchValue({ patientId: 'u1', doctorId: 'd1', instructions: 'After food' });
    c.medications.at(0).patchValue({
      name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: '5 days',
    });

    c.submit();

    // 1) POST the prescription (with the prescribing doctor captured)
    const rx = httpMock.expectOne(`${api}/prescriptions`);
    expect(rx.request.method).toBe('POST');
    expect(rx.request.body).toMatchObject({
      patientId: 'u1',
      doctorId: 'd1',
      doctorName: 'Dr. Sarah Chen',
      instructions: 'After food',
      medications: [{ name: 'Ibuprofen', dosage: '400mg' }],
    });
    rx.flush({ id: 'rx1', ...rx.request.body });

    // 2) POST a notification to the patient
    const notif = httpMock.expectOne(`${api}/notifications`);
    expect(notif.request.method).toBe('POST');
    expect(notif.request.body).toMatchObject({ userId: 'u1', type: 'confirmation' });
    notif.flush({ id: 'n1' });

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-cy="rx-saved"]')).not.toBeNull();
  });
});
