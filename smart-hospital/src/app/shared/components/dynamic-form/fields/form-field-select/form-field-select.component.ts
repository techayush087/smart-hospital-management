import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field-select',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-field-select.component.html',
  styleUrl: './form-field-select.component.css',
})
export class FormFieldSelectComponent {
  readonly control = input.required<FormControl>();
  readonly label = input('');
  readonly fieldKey = input('');
  readonly options = input<{ label: string; value: string }[]>([]);

  protected showError(): boolean {
    const c = this.control();
    return c.invalid && c.touched;
  }

  protected errorMessage(): string {
    return 'This field is required';
  }
}
