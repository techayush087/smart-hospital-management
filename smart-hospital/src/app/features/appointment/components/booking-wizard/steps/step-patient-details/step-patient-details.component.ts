import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectSelectedSlot } from '../../../../../../store/appointment-catalog';
import { FormFieldConfig, TimeSlot } from '../../../../../../core/models';
import { TimeSlotPipe } from '../../../../../../shared/pipes/time-slot.pipe';
import { APPOINTMENT_FORM_CONFIG } from '../../../../config/appointment-form.config';

@Component({
  selector: 'app-step-patient-details',
  standalone: true,
  imports: [ReactiveFormsModule, TimeSlotPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-patient-details.component.html',
  styleUrl: './step-patient-details.component.scss',
})
export class StepPatientDetailsComponent {
  private readonly store = inject(Store);

  readonly form = input.required<FormGroup>();

  protected readonly fields: FormFieldConfig[] = APPOINTMENT_FORM_CONFIG;

  protected readonly selectedSlot = toSignal(
    this.store.select(selectSelectedSlot),
    { initialValue: null as TimeSlot | null },
  );

  isInvalid(key: string): boolean {
    const control = this.form().get(key);
    return !!control && control.invalid && control.touched;
  }
}
