import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
  });

  function byCy(cy: string): HTMLElement {
    return fixture.nativeElement.querySelector(`[data-cy="${cy}"]`);
  }

  it('renders every required data-cy field', () => {
    const fields = [
      'firstName',
      'lastName',
      'email',
      'password',
      'confirmPassword',
      'dateOfBirth',
      'phone',
      'submit',
    ];
    for (const cy of fields) {
      expect(byCy(cy)).not.toBeNull();
    }
  });

  it('shows an age error when the DOB is under 18 and touched', () => {
    const now = new Date();
    const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
    const dob = fixture.componentInstance.form.get('dateOfBirth')!;
    dob.setValue(tenYearsAgo.toISOString().slice(0, 10));
    dob.markAsTouched();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toMatch(/18|age/i);
  });

  it('shows a mismatch error when passwords differ and confirm is touched', () => {
    const form = fixture.componentInstance.form;
    form.get('password')!.setValue('secret123');
    form.get('confirmPassword')!.setValue('different1');
    form.get('confirmPassword')!.markAsTouched();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toMatch(/match/i);
  });
});
