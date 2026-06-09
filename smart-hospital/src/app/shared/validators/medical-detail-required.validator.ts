import { AbstractControl, ValidatorFn, ValidationErrors, FormGroup } from '@angular/forms';

/** Group-level validator requiring the named medical-detail fields to be non-empty. */
export function medicalDetailRequiredValidator(fields: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup;
    const missing = fields.filter((f) => !g.get(f)?.value);
    return missing.length ? { medicalDetailRequired: { missing } } : null;
  };
}
