import { capitalize, slugify, truncate, initials } from './string.utils';

describe('string.utils', () => {
  describe('capitalize', () => {
    it('uppercases the first character', () => {
      expect(capitalize('hi')).toBe('Hi');
    });

    it('returns an empty string unchanged', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('slugify', () => {
    it('produces a url-safe slug', () => {
      expect(slugify('Dr. Sarah Chen')).toBe('dr-sarah-chen');
    });

    it('trims leading and trailing separators', () => {
      expect(slugify('  Hello World!  ')).toBe('hello-world');
    });
  });

  describe('truncate', () => {
    it('truncates and appends an ellipsis when over max', () => {
      expect(truncate('abcdef', 3)).toBe('abc…');
    });

    it('returns the original string when within max', () => {
      expect(truncate('abc', 5)).toBe('abc');
    });
  });

  describe('initials', () => {
    it('returns the first two name initials uppercased', () => {
      expect(initials('Sarah Chen')).toBe('SC');
    });

    it('handles a single name', () => {
      expect(initials('Sarah')).toBe('S');
    });
  });
});
