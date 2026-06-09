import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field-textarea',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-field-textarea.component.html',
  styleUrl: './form-field-textarea.component.scss',
})
export class FormFieldTextareaComponent {
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
