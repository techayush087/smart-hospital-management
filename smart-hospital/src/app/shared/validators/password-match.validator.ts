import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Group-level validator asserting `password` and `confirmPassword` match. */
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const cf = group.get('confirmPassword')?.value;
  return pw && cf && pw !== cf ? { passwordMismatch: true } : null;
}
