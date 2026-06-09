import { FormFieldConfig } from '../../core/models';
import { getValidatorsForField, buildAppointmentFormFromConfig } from './form-config.helpers';

describe('form-config.helpers', () => {
  describe('getValidatorsForField', () => {
    it('adds a required validator for required fields', () => {
      const field: FormFieldConfig = { key: 'name', label: 'Name', type: 'text', required: true };
      expect(getValidatorsForField(field).length).toBe(1);
    });

    it('adds a pattern validator for number fields', () => {
      const field: FormFieldConfig = { key: 'age', label: 'Age', type: 'number', required: false };
      expect(getValidatorsForField(field).length).toBe(1);
    });

    it('returns no validators for an optional non-number field', () => {
      const field: FormFieldConfig = { key: 'notes', label: 'Notes', type: 'text', required: false };
      expect(getValidatorsForField(field).length).toBe(0);
    });
  });

  describe('buildAppointmentFormFromConfig', () => {
    it('builds a form whose required control errors when empty', () => {
      const config: FormFieldConfig[] = [
        { key: 'reason', label: 'Reason', type: 'text', required: true },
      ];

      const form = buildAppointmentFormFromConfig(config);
      const control = form.get('reason');

      expect(control).toBeTruthy();
      expect(control?.value).toBe('');
      expect(control?.hasError('required')).toBe(true);
    });

    it('applies a pattern validator to number fields', () => {
      const config: FormFieldConfig[] = [
        { key: 'age', label: 'Age', type: 'number', required: false },
      ];

      const form = buildAppointmentFormFromConfig(config);
      const control = form.get('age');
      control?.setValue('not-a-number');

      expect(control?.hasError('pattern')).toBe(true);

      control?.setValue('42');
      expect(control?.hasError('pattern')).toBe(false);
    });

    it('uses defaultValue when provided', () => {
      const config: FormFieldConfig[] = [
        { key: 'type', label: 'Type', type: 'text', required: false, defaultValue: 'virtual' },
      ];

      const form = buildAppointmentFormFromConfig(config);
      expect(form.get('type')?.value).toBe('virtual');
    });
  });
});
