import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

/** Validates that a date control holds a value strictly in the future. */
export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return new Date(control.value).getTime() <= Date.now() ? { futureDate: true } : null;
  };
}
