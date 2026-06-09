import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { FormFieldConfig } from '../../core/models';

/** Builds the validator list for a single form-field config. */
export function getValidatorsForField(field: FormFieldConfig): ValidatorFn[] {
  const v: ValidatorFn[] = [];
  if (field.required) v.push(Validators.required);
  if (field.type === 'number') v.push(Validators.pattern(/^\d+$/));
  return v;
}

/** Builds a reactive FormGroup from an array of field configs. */
export function buildAppointmentFormFromConfig(config: FormFieldConfig[]): FormGroup {
  const fb = new FormBuilder();
  const group: Record<string, unknown> = {};
  config.forEach((f) => (group[f.key] = [f.defaultValue ?? '', getValidatorsForField(f)]));
  return fb.group(group);
}
