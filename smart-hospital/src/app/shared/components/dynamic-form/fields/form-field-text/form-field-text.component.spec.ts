import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { FormFieldTextComponent } from './form-field-text.component';

describe('FormFieldTextComponent', () => {
  let fixture: ComponentFixture<FormFieldTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldTextComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FormFieldTextComponent);
  });

  it('binds data-cy to the field key', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('fieldKey', 'insuranceId');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('[data-cy="insuranceId"]');
    expect(input).not.toBeNull();
  });

  it('shows the error when required and touched, then hides it once filled', () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('fieldKey', 'name');
    fixture.componentRef.setInput('label', 'Name');

    control.markAsTouched();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.form-field__error'),
    ).not.toBeNull();

    control.setValue('Ada');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.form-field__error')).toBeNull();
  });
});
