import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { AuthService } from '../../../../core/services/auth.service';

interface Preferences {
  emailReminders: boolean;
  smsReminders: boolean;
  reminderLeadTime: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, AppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  readonly profileSaved = signal(false);
  readonly preferencesSaved = signal(false);

  // Reactive section: name, contact, medical summary.
  readonly profileForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    medicalSummary: [''],
  });

  // Template-driven section: bound via [(ngModel)] (NOT FormControl).
  preferences: Preferences = {
    emailReminders: true,
    smsReminders: false,
    reminderLeadTime: 24,
  };

  readonly savedPreferences = signal<Preferences | null>(null);

  constructor() {
    const user = this.auth.getCurrentUser()();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        medicalSummary: (user.existingConditions ?? []).join(', '),
      });
    }
  }

  saveProfile(): void {
    this.profileSaved.set(false);
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.profileSaved.set(true);
  }

  savePreferences(form: NgForm): void {
    this.preferencesSaved.set(false);
    if (form.invalid) {
      return;
    }
    this.savedPreferences.set({ ...this.preferences });
    this.preferencesSaved.set(true);
  }
}
