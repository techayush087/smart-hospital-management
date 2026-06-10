import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { environment } from '../../../../../environments/environment';

describe('ForgotPasswordComponent', () => {
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let httpMock: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ForgotPasswordComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('starts on the email step', () => {
    expect(fixture.componentInstance.step()).toBe('email');
    expect(fixture.nativeElement.querySelector('[data-cy="fp-email"]')).not.toBeNull();
  });

  it('advances to the reset step with a dev token for an existing account', () => {
    fixture.componentInstance.emailForm.setValue({ email: 'patient@test.com' });
    fixture.componentInstance.submitEmail();

    const req = httpMock.expectOne(`${api}/auth/forgot-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('patient@test.com');
    req.flush({ message: 'sent', devToken: 'dev-token-123' });
    fixture.detectChanges();

    expect(fixture.componentInstance.step()).toBe('reset');
    expect(fixture.nativeElement.querySelector('[data-cy="fp-password"]')).not.toBeNull();
  });

  it('shows the generic "sent" state when no account exists (no enumeration)', () => {
    fixture.componentInstance.emailForm.setValue({ email: 'nobody@test.com' });
    fixture.componentInstance.submitEmail();

    // Backend returns a uniform 200 with no devToken for unknown emails.
    const req = httpMock.expectOne(`${api}/auth/forgot-password`);
    req.flush({ message: 'If an account exists for that email, a reset link has been sent.' });
    fixture.detectChanges();

    expect(fixture.componentInstance.step()).toBe('sent');
    // It must NOT reveal that the account is missing.
    expect(fixture.componentInstance.error()).toBe('');
  });

  it('resets the password using the token and reaches the done step', () => {
    fixture.componentInstance.emailForm.setValue({ email: 'patient@test.com' });
    fixture.componentInstance.submitEmail();
    httpMock
      .expectOne(`${api}/auth/forgot-password`)
      .flush({ message: 'sent', devToken: 'dev-token-123' });
    fixture.detectChanges();

    fixture.componentInstance.resetForm.setValue({
      password: 'NewPass1!',
      confirmPassword: 'NewPass1!',
    });
    fixture.componentInstance.submitReset();

    const req = httpMock.expectOne(`${api}/auth/reset-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'dev-token-123', password: 'NewPass1!' });
    req.flush({ message: 'updated' });
    fixture.detectChanges();

    expect(fixture.componentInstance.step()).toBe('done');
  });
});
