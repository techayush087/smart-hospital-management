import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { TimeSlot } from '../../core/models';

/** Validates that the selected start time does not collide with an already-taken slot. */
export function appointmentOverlapValidator(existing: TimeSlot[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const sel: string = control.value;
    if (!sel) return null;
    return existing.some((s) => s.startTime === sel && !s.isAvailable)
      ? { appointmentOverlap: true }
      : null;
  };
}
