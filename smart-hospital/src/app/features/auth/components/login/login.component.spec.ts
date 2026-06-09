import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  function byCy(cy: string): HTMLElement {
    return fixture.nativeElement.querySelector(`[data-cy="${cy}"]`);
  }

  it('renders the email, password, and submit controls', () => {
    expect(byCy('email')).not.toBeNull();
    expect(byCy('password')).not.toBeNull();
    expect(byCy('submit')).not.toBeNull();
  });

  it('starts with an invalid form when empty', () => {
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('surfaces required errors after an invalid submit', () => {
    fixture.componentInstance.onSubmit();
    fixture.detectChanges();
    const errors = fixture.nativeElement.querySelectorAll('.field__error');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('becomes valid once email and password are provided', () => {
    fixture.componentInstance.form.patchValue({
      email: 'ada@example.com',
      password: 'secret123',
    });
    expect(fixture.componentInstance.form.valid).toBe(true);
  });
});
