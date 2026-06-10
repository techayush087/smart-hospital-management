import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { AuthService } from '../../../../core/services/auth.service';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';

type Step = 'email' | 'sent' | 'reset' | 'done';

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
  /** Dev-only: surfaced because the mock backend can't email the link. */
  readonly devNotice = signal(false);

  private resetToken = '';

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
    // The backend always responds the same way (no enumeration). When an account
    // exists, the mock returns a dev-only token standing in for the emailed link.
    this.auth.requestPasswordReset(email).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.devToken) {
          this.resetToken = res.devToken;
          this.devNotice.set(true);
          this.step.set('reset');
        } else {
          // No account (or no token): show the generic "check your email" state so
          // the UI never reveals whether the email is registered.
          this.step.set('sent');
        }
      },
      error: () => {
        this.loading.set(false);
        this.step.set('sent');
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
    this.auth.resetPassword(this.resetToken, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('done');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Your reset link is invalid or expired. Request a new one.');
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
