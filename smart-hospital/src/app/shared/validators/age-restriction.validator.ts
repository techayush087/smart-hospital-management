import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

/** Validates that a date-of-birth control yields an age within [min, max]. */
export function ageRestrictionValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const dob = new Date(control.value);
    if (isNaN(dob.getTime())) return { ageRestriction: { reason: 'invalid' } };
    const age = Math.floor((Date.now() - dob.getTime()) / 31557600000);
    if (age < min) return { ageRestriction: { reason: 'tooYoung', min } };
    if (age > max) return { ageRestriction: { reason: 'tooOld', max } };
    return null;
  };
}
