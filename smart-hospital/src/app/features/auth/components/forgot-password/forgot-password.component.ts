import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { AuthService } from '../../../../core/services/auth.service';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';

type Step = 'email' | 'reset' | 'done';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly step = signal<Step>('email');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);

  private verifiedEmail = '';

  readonly emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly resetForm = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  submitEmail(): void {
    this.error.set('');
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    const email = this.emailForm.getRawValue().email ?? '';
    this.loading.set(true);
    this.auth.requestPasswordReset(email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.verifiedEmail = res.email;
        this.step.set('reset');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No account found for that email.');
      },
    });
  }

  submitReset(): void {
    this.error.set('');
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    const password = this.resetForm.getRawValue().password ?? '';
    this.loading.set(true);
    this.auth.resetPassword(this.verifiedEmail, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('done');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Something went wrong. Please try again.');
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
