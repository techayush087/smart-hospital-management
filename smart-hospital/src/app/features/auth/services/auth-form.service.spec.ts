import { TestBed } from '@angular/core/testing';
import { AuthFormService } from './auth-form.service';

describe('AuthFormService', () => {
  let service: AuthFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthFormService);
  });

  describe('buildLoginForm', () => {
    it('exposes email and password controls', () => {
      const form = service.buildLoginForm();
      expect(form.get('email')).not.toBeNull();
      expect(form.get('password')).not.toBeNull();
    });

    it('is invalid when empty', () => {
      const form = service.buildLoginForm();
      expect(form.valid).toBe(false);
    });

    it('is valid with a good email and password', () => {
      const form = service.buildLoginForm();
      form.patchValue({ email: 'ada@example.com', password: 'secret123' });
      expect(form.valid).toBe(true);
    });
  });

  describe('buildRegisterForm', () => {
    it('yields a passwordMismatch group error when passwords differ', () => {
      const form = service.buildRegisterForm();
      form.patchValue({ password: 'secret123', confirmPassword: 'different1' });
      expect(form.errors?.['passwordMismatch']).toBe(true);
    });

    it('clears the passwordMismatch error when passwords match', () => {
      const form = service.buildRegisterForm();
      form.patchValue({ password: 'secret123', confirmPassword: 'secret123' });
      expect(form.errors?.['passwordMismatch']).toBeUndefined();
    });

    it('yields an ageRestriction error on dateOfBirth for an under-18 DOB', () => {
      const form = service.buildRegisterForm();
      const now = new Date();
      const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
      form.get('dateOfBirth')!.setValue(tenYearsAgo.toISOString().slice(0, 10));
      expect(form.get('dateOfBirth')!.errors?.['ageRestriction']).toBeTruthy();
    });

    it('accepts an adult DOB on the dateOfBirth control', () => {
      const form = service.buildRegisterForm();
      const now = new Date();
      const thirtyYearsAgo = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());
      form.get('dateOfBirth')!.setValue(thirtyYearsAgo.toISOString().slice(0, 10));
      expect(form.get('dateOfBirth')!.errors).toBeNull();
    });
  });
});
