import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field-checkbox',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-field-checkbox.component.html',
  styleUrl: './form-field-checkbox.component.css',
})
export class FormFieldCheckboxComponent {
  readonly control = input.required<FormControl>();
  readonly label = input('');
  readonly fieldKey = input('');

  protected showError(): boolean {
    const c = this.control();
    return c.invalid && c.touched;
  }

  protected errorMessage(): string {
    return 'This field is required';
  }
}
