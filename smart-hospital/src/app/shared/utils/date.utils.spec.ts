import {
  toISODate,
  isToday,
  addDays,
  formatDisplayDate,
  getDateRange,
  isDateInPast,
  minutesToDurationString,
} from './date.utils';

describe('date.utils', () => {
  describe('toISODate', () => {
    it('extracts the ISO date portion (UTC) from a Date', () => {
      expect(toISODate(new Date('2026-06-09T10:00:00Z'))).toBe('2026-06-09');
    });
  });

  describe('isToday', () => {
    it('returns true for the current date', () => {
      expect(isToday(new Date().toISOString())).toBe(true);
    });

    it('returns false for a past date', () => {
      expect(isToday('2000-01-01T00:00:00Z')).toBe(false);
    });
  });

  describe('addDays', () => {
    it('adds days and returns a new Date', () => {
      const start = new Date('2026-06-09T00:00:00Z');
      const result = addDays(start, 2);
      expect(toISODate(result)).toBe('2026-06-11');
      // original is not mutated
      expect(toISODate(start)).toBe('2026-06-09');
    });

    it('subtracts days with a negative value', () => {
      expect(toISODate(addDays(new Date('2026-06-09T00:00:00Z'), -1))).toBe('2026-06-08');
    });
  });

  describe('formatDisplayDate', () => {
    it('formats a date in a human-readable en-US form', () => {
      expect(formatDisplayDate('2026-06-09T00:00:00Z')).toBe('Jun 9, 2026');
    });
  });

  describe('getDateRange', () => {
    it('returns an inclusive array of ISO dates', () => {
      expect(getDateRange('2026-06-09', '2026-06-11')).toEqual([
        '2026-06-09',
        '2026-06-10',
        '2026-06-11',
      ]);
    });

    it('returns a single date when start equals end', () => {
      expect(getDateRange('2026-06-09', '2026-06-09')).toEqual(['2026-06-09']);
    });
  });

  describe('isDateInPast', () => {
    it('returns true for a clearly past date', () => {
      expect(isDateInPast('2000-01-01T00:00:00Z')).toBe(true);
    });

    it('returns false for a clearly future date', () => {
      expect(isDateInPast('2999-01-01T00:00:00Z')).toBe(false);
    });
  });

  describe('minutesToDurationString', () => {
    it('formats hours and minutes', () => {
      expect(minutesToDurationString(90)).toBe('1h 30m');
    });

    it('formats minutes only', () => {
      expect(minutesToDurationString(30)).toBe('30m');
    });

    it('formats whole hours only', () => {
      expect(minutesToDurationString(60)).toBe('1h');
    });
  });
});
