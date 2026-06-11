import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFieldConfig } from '../../../core/models';
import { FormFieldTextComponent } from './fields/form-field-text/form-field-text.component';
import { FormFieldTextareaComponent } from './fields/form-field-textarea/form-field-textarea.component';
import { FormFieldSelectComponent } from './fields/form-field-select/form-field-select.component';
import { FormFieldDateComponent } from './fields/form-field-date/form-field-date.component';
import { FormFieldNumberComponent } from './fields/form-field-number/form-field-number.component';
import { FormFieldCheckboxComponent } from './fields/form-field-checkbox/form-field-checkbox.component';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormFieldTextComponent,
    FormFieldTextareaComponent,
    FormFieldSelectComponent,
    FormFieldDateComponent,
    FormFieldNumberComponent,
    FormFieldCheckboxComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css',
})
export class DynamicFormComponent {
  readonly config = input.required<FormFieldConfig[]>();
  readonly form = input.required<FormGroup>();

  ctrl(key: string): FormControl {
    return this.form().get(key) as FormControl;
  }
}
