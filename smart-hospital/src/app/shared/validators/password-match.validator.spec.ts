import { FormBuilder } from '@angular/forms';
import { passwordMatchValidator } from './password-match.validator';

describe('passwordMatchValidator', () => {
  it('returns a mismatch error when passwords differ', () => {
    const group = new FormBuilder().group({
      password: ['secret123'],
      confirmPassword: ['different'],
    });

    expect(passwordMatchValidator(group)).toEqual({ passwordMismatch: true });
  });

  it('returns null when passwords match', () => {
    const group = new FormBuilder().group({
      password: ['secret123'],
      confirmPassword: ['secret123'],
    });

    expect(passwordMatchValidator(group)).toBeNull();
  });
});
