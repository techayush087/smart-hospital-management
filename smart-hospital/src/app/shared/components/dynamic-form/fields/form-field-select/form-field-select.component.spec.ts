import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { FormFieldSelectComponent } from './form-field-select.component';

describe('FormFieldSelectComponent', () => {
  let fixture: ComponentFixture<FormFieldSelectComponent>;

  const options = [
    { label: 'Routine', value: 'routine' },
    { label: 'Urgent', value: 'urgent' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldSelectComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FormFieldSelectComponent);
  });

  it('renders every provided option plus the placeholder', () => {
    const control = new FormControl('');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('fieldKey', 'urgency');
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();

    const renderedOptions: HTMLOptionElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('option'),
    );
    // 2 options + 1 disabled placeholder.
    expect(renderedOptions.length).toBe(3);
    expect(renderedOptions[1].textContent).toContain('Routine');
    expect(renderedOptions[2].textContent).toContain('Urgent');
  });

  it('updates the control value when a selection is made', () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('fieldKey', 'urgency');
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();

    const select: HTMLSelectElement =
      fixture.nativeElement.querySelector('[data-cy="urgency"]');
    select.value = 'urgent';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(control.value).toBe('urgent');
  });
});
