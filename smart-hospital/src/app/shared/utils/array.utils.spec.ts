import { groupBy, uniqueBy, sortByDate } from './array.utils';

describe('array.utils', () => {
  describe('groupBy', () => {
    it('groups items by the given key', () => {
      const result = groupBy([{ t: 'a' }, { t: 'b' }, { t: 'a' }], 't');
      expect(Object.keys(result).sort()).toEqual(['a', 'b']);
      expect(result['a'].length).toBe(2);
      expect(result['b'].length).toBe(1);
    });
  });

  describe('uniqueBy', () => {
    it('removes duplicates by key, keeping first occurrence', () => {
      const result = uniqueBy([{ id: 1 }, { id: 1 }, { id: 2 }], 'id');
      expect(result.length).toBe(2);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('sortByDate', () => {
    const items = [
      { d: '2026-06-11', label: 'late' },
      { d: '2026-06-09', label: 'early' },
    ];

    it('sorts ascending by default', () => {
      expect(sortByDate(items, 'd').map((i) => i.label)).toEqual(['early', 'late']);
    });

    it('sorts descending when requested', () => {
      expect(sortByDate(items, 'd', 'desc').map((i) => i.label)).toEqual(['late', 'early']);
    });

    it('does not mutate the original array', () => {
      sortByDate(items, 'd');
      expect(items[0].label).toBe('late');
    });
  });
});
