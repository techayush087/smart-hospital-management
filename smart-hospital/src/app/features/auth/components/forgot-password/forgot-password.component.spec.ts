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

  it('verifies the email then advances to the reset step', () => {
    fixture.componentInstance.emailForm.setValue({ email: 'patient@test.com' });
    fixture.componentInstance.submitEmail();

    const req = httpMock.expectOne(`${api}/auth/forgot-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('patient@test.com');
    req.flush({ email: 'patient@test.com', message: 'ok' });
    fixture.detectChanges();

    expect(fixture.componentInstance.step()).toBe('reset');
    expect(fixture.nativeElement.querySelector('[data-cy="fp-password"]')).not.toBeNull();
  });

  it('shows an error when the email is not found', () => {
    fixture.componentInstance.emailForm.setValue({ email: 'nobody@test.com' });
    fixture.componentInstance.submitEmail();

    const req = httpMock.expectOne(`${api}/auth/forgot-password`);
    req.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(fixture.componentInstance.step()).toBe('email');
    expect(fixture.componentInstance.error()).toContain('No account');
  });

  it('resets the password and reaches the done step', () => {
    // advance to reset step
    fixture.componentInstance.emailForm.setValue({ email: 'patient@test.com' });
    fixture.componentInstance.submitEmail();
    httpMock
      .expectOne(`${api}/auth/forgot-password`)
      .flush({ email: 'patient@test.com', message: 'ok' });
    fixture.detectChanges();

    fixture.componentInstance.resetForm.setValue({
      password: 'NewPass1!',
      confirmPassword: 'NewPass1!',
    });
    fixture.componentInstance.submitReset();

    const req = httpMock.expectOne(`${api}/auth/reset-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'patient@test.com', password: 'NewPass1!' });
    req.flush({ message: 'updated' });
    fixture.detectChanges();

    expect(fixture.componentInstance.step()).toBe('done');
  });
});
