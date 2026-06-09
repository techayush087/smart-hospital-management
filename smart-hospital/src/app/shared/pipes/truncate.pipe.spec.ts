import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  it('truncates and appends an ellipsis when over max', () => {
    expect(pipe.transform('abcdef', 3)).toBe('abc…');
  });

  it('returns the original string when within max', () => {
    expect(pipe.transform('abc', 5)).toBe('abc');
  });

  it('returns an empty string for an empty input', () => {
    expect(pipe.transform('', 3)).toBe('');
  });

  it('returns an empty string for undefined input', () => {
    expect(pipe.transform(undefined as unknown as string, 3)).toBe('');
  });
});
