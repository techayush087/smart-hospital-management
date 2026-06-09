import { AgePipe } from './age.pipe';

describe('AgePipe', () => {
  const pipe = new AgePipe();

  it('computes the age in whole years from a date of birth', () => {
    const dob = new Date(Date.now() - 30 * 31557600000).toISOString();
    expect(pipe.transform(dob)).toBe('30 years old');
  });

  it('returns an empty string for an empty input', () => {
    expect(pipe.transform('')).toBe('');
  });
});
