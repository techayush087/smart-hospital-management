import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginDto } from '../../../../core/models';
import { AuthFormService } from '../../services/auth-form.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authForm = inject(AuthFormService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly form = this.authForm.buildLoginForm();
  readonly loading = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    const credentials: LoginDto = { email: email ?? '', password: password ?? '' };

    this.loading.set(true);
    this.auth.login(credentials).subscribe({
      next: () => {
        this.loading.set(false);
        const role = this.auth.getCurrentUser()()?.role;
        const target = role === 'admin' ? '/admin/dashboard' : '/patient/dashboard';
        this.router.navigateByUrl(target);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Invalid email or password');
      },
    });
  }
}
