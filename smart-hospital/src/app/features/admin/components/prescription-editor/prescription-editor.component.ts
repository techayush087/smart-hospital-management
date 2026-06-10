import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { AdminService } from '../../services/admin.service';
import { ApiService } from '../../../../core/services/api.service';
import { NotificationApiService } from '../../../notifications/services/notification-api.service';
import { Appointment, Doctor, PatientRecord, Prescription } from '../../../../core/models';
import { toISODate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-prescription-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    AppButtonComponent,
    DatePickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './prescription-editor.component.html',
  styleUrl: './prescription-editor.component.scss',
})
export class PrescriptionEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private api = inject(ApiService);
  private notifyApi = inject(NotificationApiService);
  private route = inject(ActivatedRoute);

  protected readonly patients = signal<PatientRecord[]>([]);
  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly loading = signal(false);
  protected readonly savedMessage = signal('');
  protected readonly today = toISODate(new Date());

  /** When opened from an appointment's "Prescribe" button, link the Rx to it. */
  private linkedAppointmentId = '';

  protected readonly form = this.fb.group({
    patientId: ['', Validators.required],
    doctorId: ['', Validators.required],
    instructions: ['', Validators.required],
    validUntil: [''],
    medications: this.fb.array([this.newMedication()]),
  });

  get medications(): FormArray {
    return this.form.get('medications') as FormArray;
  }

  ngOnInit(): void {
    this.adminService.getPatientRecords().subscribe((list) => this.patients.set(list));
    this.api.get<Doctor[]>('/doctors').subscribe((list) => this.doctors.set(list));

    // Pre-fill when arriving from an appointment's "Prescribe" button.
    const params = this.route.snapshot.queryParamMap;
    const patientId = params.get('patientId');
    this.linkedAppointmentId = params.get('appointmentId') ?? '';
    if (patientId) this.form.patchValue({ patientId });

    // If we came from a specific appointment, auto-select its doctor.
    if (this.linkedAppointmentId) {
      this.api
        .get<Appointment>(`/appointments/${this.linkedAppointmentId}`)
        .subscribe((appt) => {
          if (appt?.doctorId) this.form.patchValue({ doctorId: appt.doctorId });
        });
    }
  }

  protected doctorName(id: string): string {
    return this.doctors().find((d) => d.id === id)?.name ?? '';
  }
  private doctorSpec(id: string): string {
    return this.doctors().find((d) => d.id === id)?.specialization ?? '';
  }

  private newMedication() {
    return this.fb.group({
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      duration: ['', Validators.required],
    });
  }

  addMedication(): void {
    this.medications.push(this.newMedication());
  }

  removeMedication(index: number): void {
    if (this.medications.length > 1) this.medications.removeAt(index);
  }

  patientName(id: string): string {
    return this.patients().find((p) => p.id === id)?.fullName ?? 'the patient';
  }

  submit(): void {
    this.savedMessage.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const patientId = v.patientId ?? '';
    const doctorId = v.doctorId ?? '';
    const prescription: Omit<Prescription, 'id'> = {
      appointmentId: this.linkedAppointmentId,
      patientId,
      doctorId,
      doctorName: this.doctorName(doctorId),
      specialization: this.doctorSpec(doctorId),
      instructions: v.instructions ?? '',
      issuedAt: new Date().toISOString(),
      validUntil: v.validUntil || undefined,
      medications: (v.medications ?? []).map((m) => ({
        name: m.name ?? '',
        dosage: m.dosage ?? '',
        frequency: m.frequency ?? '',
        duration: m.duration ?? '',
      })),
    };

    this.loading.set(true);
    this.adminService
      .createPrescription(prescription)
      .pipe(
        switchMap(() =>
          // Notify the patient that a new prescription is available.
          this.notifyApi.create({
            userId: patientId,
            type: 'confirmation',
            title: 'New prescription added',
            message: 'A new prescription is available in your account.',
          }),
        ),
      )
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.savedMessage.set(
            `Prescription saved for ${this.patientName(patientId)}.`,
          );
          this.resetForm();
        },
        error: () => {
          this.loading.set(false);
          this.savedMessage.set('Could not save the prescription. Please try again.');
        },
      });
  }

  private resetForm(): void {
    this.form.reset({ patientId: '', doctorId: '', instructions: '', validUntil: '' });
    this.medications.clear();
    this.medications.push(this.newMedication());
  }
}
