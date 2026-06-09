import { Injectable, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ageRestrictionValidator } from '../../../shared/validators/age-restriction.validator';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';

@Injectable({ providedIn: 'root' })
export class AuthFormService {
  private fb = inject(FormBuilder);

  buildLoginForm() {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  buildRegisterForm() {
    return this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        dateOfBirth: ['', [Validators.required, ageRestrictionValidator(18, 100)]],
        phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
        role: ['customer', [Validators.required]],
        bloodGroup: [''],
        allergies: [''],
        existingConditions: [''],
      },
      { validators: passwordMatchValidator },
    );
  }
}
