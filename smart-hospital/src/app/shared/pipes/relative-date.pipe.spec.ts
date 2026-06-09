import { RelativeDatePipe } from './relative-date.pipe';
import { addDays } from '../utils/date.utils';

describe('RelativeDatePipe', () => {
  const pipe = new RelativeDatePipe();

  it('returns Today for the current date', () => {
    expect(pipe.transform(new Date().toISOString())).toBe('Today');
  });

  it('returns Yesterday for the previous day', () => {
    expect(pipe.transform(addDays(new Date(), -1).toISOString())).toBe('Yesterday');
  });

  it('returns a formatted date for older dates', () => {
    const result = pipe.transform(addDays(new Date(), -365).toISOString());
    expect(result).not.toBe('Today');
    expect(result).not.toBe('Yesterday');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns an empty string for an empty input', () => {
    expect(pipe.transform('')).toBe('');
  });
});
