import { AbstractControl } from '@angular/forms';
import { futureDateValidator } from './future-date.validator';

function controlWith(value: unknown): AbstractControl {
  return { value } as AbstractControl;
}

describe('futureDateValidator', () => {
  const validator = futureDateValidator();

  it('returns an error for a past date', () => {
    expect(validator(controlWith('2000-01-01T00:00:00Z'))).toEqual({ futureDate: true });
  });

  it('returns null for a clearly future date', () => {
    expect(validator(controlWith('2999-01-01T00:00:00Z'))).toBeNull();
  });

  it('returns null for an empty value', () => {
    expect(validator(controlWith(''))).toBeNull();
  });
});
