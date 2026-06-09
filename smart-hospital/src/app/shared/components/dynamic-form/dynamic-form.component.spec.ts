import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldConfig } from '../../../core/models';
import { buildAppointmentFormFromConfig } from '../../helpers/form-config.helpers';
import { DynamicFormComponent } from './dynamic-form.component';

describe('DynamicFormComponent', () => {
  let fixture: ComponentFixture<DynamicFormComponent>;

  const config: FormFieldConfig[] = [
    { key: 'reason', label: 'Reason', type: 'text', required: true },
    {
      key: 'urgency',
      label: 'Urgency',
      type: 'select',
      required: true,
      options: [
        { label: 'Routine', value: 'routine' },
        { label: 'Urgent', value: 'urgent' },
      ],
    },
    { key: 'notes', label: 'Notes', type: 'textarea', required: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DynamicFormComponent);
    fixture.componentRef.setInput('config', config);
    fixture.componentRef.setInput('form', buildAppointmentFormFromConfig(config));
    fixture.detectChanges();
  });

  it('renders one field component per config entry, by type', () => {
    expect(
      fixture.nativeElement.querySelectorAll('app-form-field-text').length,
    ).toBe(1);
    expect(
      fixture.nativeElement.querySelectorAll('app-form-field-select').length,
    ).toBe(1);
    expect(
      fixture.nativeElement.querySelectorAll('app-form-field-textarea').length,
    ).toBe(1);
  });

  it('shows the error for a required text field once it is touched', () => {
    const form = fixture.componentInstance.form();
    form.get('reason')!.markAsTouched();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector(
      'app-form-field-text .form-field__error',
    );
    expect(error).not.toBeNull();
  });
});
