import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectSelectedSlot } from '../../../../store/appointment-catalog';
import { Doctor, TimeSlot } from '../../../../core/models';
import { DoctorService } from '../../../doctors/services/doctor.service';
import { buildAppointmentFormFromConfig } from '../../../../shared/helpers/form-config.helpers';
import { APPOINTMENT_FORM_CONFIG } from '../../config/appointment-form.config';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { StepSelectSlotComponent } from './steps/step-select-slot/step-select-slot.component';
import { StepPatientDetailsComponent } from './steps/step-patient-details/step-patient-details.component';
import { StepConfirmationComponent } from './steps/step-confirmation/step-confirmation.component';

interface StepMeta {
  index: 1 | 2 | 3;
  label: string;
}

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [
    AppButtonComponent,
    StepSelectSlotComponent,
    StepPatientDetailsComponent,
    StepConfirmationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-wizard.component.html',
  styleUrl: './booking-wizard.component.css',
})
export class BookingWizardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly doctorService = inject(DoctorService);
  private readonly store = inject(Store);

  protected readonly doctorId =
    this.route.snapshot.paramMap.get('docId') ?? '';
  protected readonly doctor = signal<Doctor | null>(null);
  protected readonly currentStep = signal<1 | 2 | 3>(1);

  protected readonly form: FormGroup = buildAppointmentFormFromConfig(
    APPOINTMENT_FORM_CONFIG,
  );

  protected readonly steps: StepMeta[] = [
    { index: 1, label: 'Select Slot' },
    { index: 2, label: 'Details' },
    { index: 3, label: 'Confirm' },
  ];

  protected readonly selectedSlot = toSignal(
    this.store.select(selectSelectedSlot),
    { initialValue: null as TimeSlot | null },
  );

  ngOnInit(): void {
    if (this.doctorId) {
      this.doctorService.getDoctorById(this.doctorId).subscribe((doctor) => {
        this.doctor.set(doctor);
      });
    }
  }

  canAdvance(): boolean {
    if (this.currentStep() === 1) {
      return !!this.selectedSlot();
    }
    if (this.currentStep() === 2) {
      return this.form.valid;
    }
    return true;
  }

  next(): void {
    if (!this.canAdvance()) {
      if (this.currentStep() === 2) {
        this.form.markAllAsTouched();
      }
      return;
    }
    const step = this.currentStep();
    if (step < 3) {
      this.currentStep.set((step + 1) as 1 | 2 | 3);
    }
  }

  back(): void {
    const step = this.currentStep();
    if (step > 1) {
      this.currentStep.set((step - 1) as 1 | 2 | 3);
    }
  }
}
