import { FormBuilder } from '@angular/forms';
import { FormFieldConfig } from '../../core/models';
import {
  buildFormGroupFromConfig,
  getFormErrors,
  markAllAsTouched,
  patchFormSafely,
} from './form.utils';

describe('form.utils', () => {
  const config: FormFieldConfig[] = [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'notes', label: 'Notes', type: 'textarea', required: false, defaultValue: 'hi' },
  ];

  function build() {
    return buildFormGroupFromConfig(config, new FormBuilder());
  }

  describe('buildFormGroupFromConfig', () => {
    it('creates a control per config field with default values', () => {
      const form = build();
      expect(Object.keys(form.controls).sort()).toEqual(['name', 'notes']);
      expect(form.get('name')!.value).toBe('');
      expect(form.get('notes')!.value).toBe('hi');
    });

    it('applies required validators', () => {
      const form = build();
      expect(form.get('name')!.valid).toBe(false);
      expect(form.get('notes')!.valid).toBe(true);
    });
  });

  describe('getFormErrors after markAllAsTouched', () => {
    it('reports the required error for the required field', () => {
      const form = build();
      markAllAsTouched(form);
      const errors = getFormErrors(form);
      expect(errors['name']).toEqual(['required']);
      expect(errors['notes']).toBeUndefined();
    });
  });

  describe('patchFormSafely', () => {
    it('patches only known controls and ignores unknown keys', () => {
      const form = build();
      patchFormSafely(form, { name: 'Sarah', unknown: 'x' });
      expect(form.get('name')!.value).toBe('Sarah');
      expect(form.get('unknown' as never)).toBeNull();
    });
  });
});
