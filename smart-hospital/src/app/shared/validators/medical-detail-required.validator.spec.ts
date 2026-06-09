import { FormBuilder } from '@angular/forms';
import { medicalDetailRequiredValidator } from './medical-detail-required.validator';

describe('medicalDetailRequiredValidator', () => {
  const validator = medicalDetailRequiredValidator(['symptoms', 'allergies']);

  it('returns an error listing the missing fields', () => {
    const group = new FormBuilder().group({
      symptoms: [''],
      allergies: ['Penicillin'],
    });

    expect(validator(group)).toEqual({ medicalDetailRequired: { missing: ['symptoms'] } });
  });

  it('returns null when all required fields are filled', () => {
    const group = new FormBuilder().group({
      symptoms: ['Headache'],
      allergies: ['Penicillin'],
    });

    expect(validator(group)).toBeNull();
  });
});
