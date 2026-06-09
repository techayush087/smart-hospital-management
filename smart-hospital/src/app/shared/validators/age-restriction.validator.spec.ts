import { AbstractControl } from '@angular/forms';
import { ageRestrictionValidator } from './age-restriction.validator';

function controlWith(value: unknown): AbstractControl {
  return { value } as AbstractControl;
}

/** ISO date string for a DOB `years` ago from now. */
function dobYearsAgo(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString();
}

describe('ageRestrictionValidator', () => {
  const validator = ageRestrictionValidator(18, 100);

  it('returns null for a valid age within range', () => {
    expect(validator(controlWith(dobYearsAgo(30)))).toBeNull();
  });

  it('returns a tooYoung error below the minimum', () => {
    const result = validator(controlWith(dobYearsAgo(10)));
    expect(result).toEqual({ ageRestriction: { reason: 'tooYoung', min: 18 } });
  });

  it('returns a tooOld error above the maximum', () => {
    const result = validator(controlWith(dobYearsAgo(120)));
    expect(result).toEqual({ ageRestriction: { reason: 'tooOld', max: 100 } });
  });

  it('returns an invalid error for an unparseable date string', () => {
    const result = validator(controlWith('not-a-date'));
    expect(result).toEqual({ ageRestriction: { reason: 'invalid' } });
  });

  it('returns null for an empty value', () => {
    expect(validator(controlWith(''))).toBeNull();
  });
});
