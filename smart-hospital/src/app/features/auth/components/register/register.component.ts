import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterDto } from '../../../../core/models';
import { toISODate } from '../../../../shared/utils/date.utils';
import { AuthFormService } from '../../services/auth-form.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AppButtonComponent, DatePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private authForm = inject(AuthFormService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly form = this.authForm.buildRegisterForm();
  readonly loading = signal(false);
  readonly error = signal('');

  readonly bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  /** DOB can't be in the future; cap the year list at ~120 years back. */
  readonly today = toISODate(new Date());
  readonly minBirthDate = toISODate(
    new Date(new Date().getFullYear() - 120, 0, 1),
  );

  private toList(value: string | null | undefined): string[] {
    return (value ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  onSubmit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const dto: RegisterDto = {
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      email: value.email ?? '',
      password: value.password ?? '',
      dateOfBirth: value.dateOfBirth ?? '',
      phone: value.phone ?? '',
      role: (value.role as RegisterDto['role']) ?? 'customer',
      bloodGroup: value.bloodGroup || undefined,
      allergies: this.toList(value.allergies),
      existingConditions: this.toList(value.existingConditions),
    };

    this.loading.set(true);
    this.auth.register(dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/auth/login');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Registration failed. Please try again.');
      },
    });
  }
}
