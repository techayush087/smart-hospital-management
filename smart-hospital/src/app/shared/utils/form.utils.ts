import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { FormFieldConfig } from '../../core/models';

/** Pure-ish reactive-forms helpers (operate on the passed FormGroup). */

/** Marks every control in the group as touched to surface validation errors. */
export function markAllAsTouched(form: FormGroup): void {
  form.markAllAsTouched();
}

/** Returns a map of control name to the list of active error keys. */
export function getFormErrors(form: FormGroup): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  Object.keys(form.controls).forEach((name) => {
    const errs = form.get(name)?.errors;
    if (errs) {
      out[name] = Object.keys(errs);
    }
  });
  return out;
}

/** Patches only the controls that already exist on the form, ignoring extras. */
export function patchFormSafely(form: FormGroup, data: Record<string, unknown>): void {
  Object.keys(data).forEach((k) => {
    if (form.get(k)) {
      form.get(k)!.patchValue(data[k]);
    }
  });
}

/** Builds a FormGroup from declarative field config, wiring required validators. */
export function buildFormGroupFromConfig(config: FormFieldConfig[], fb: FormBuilder): FormGroup {
  const group: Record<string, unknown> = {};
  config.forEach((f) => {
    const v: ValidatorFn[] = [];
    if (f.required) {
      v.push(Validators.required);
    }
    group[f.key] = [f.defaultValue ?? '', v];
  });
  return fb.group(group);
}
