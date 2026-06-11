import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePickerComponent } from '../../../date-picker/date-picker.component';

@Component({
  selector: 'app-form-field-date',
  standalone: true,
  imports: [ReactiveFormsModule, DatePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-field-date.component.html',
  styleUrl: './form-field-date.component.css',
})
export class FormFieldDateComponent {
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
