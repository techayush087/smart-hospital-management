import { HttpErrorResponse } from '@angular/common/http';
import { buildQueryParams, handleApiError } from './http.utils';

describe('http.utils', () => {
  describe('buildQueryParams', () => {
    it('includes defined, non-empty values and skips null/undefined/empty', () => {
      const params = buildQueryParams({ a: 1, b: undefined, c: '', d: null });
      const str = params.toString();
      expect(str).toContain('a=1');
      expect(params.has('b')).toBe(false);
      expect(params.has('c')).toBe(false);
      expect(params.has('d')).toBe(false);
    });

    it('serializes multiple values', () => {
      const params = buildQueryParams({ page: 2, size: 10 });
      expect(params.get('page')).toBe('2');
      expect(params.get('size')).toBe('10');
    });
  });

  describe('handleApiError', () => {
    it('returns a network message for status 0', () => {
      const error = { status: 0 } as HttpErrorResponse;
      expect(handleApiError(error)).toBe('Network error. Check your connection.');
    });

    it('returns the server-provided message when available', () => {
      const error = { status: 500, error: { message: 'boom' } } as HttpErrorResponse;
      expect(handleApiError(error)).toBe('boom');
    });

    it('falls back to a generic message', () => {
      const error = { status: 500, error: {} } as HttpErrorResponse;
      expect(handleApiError(error)).toBe('An unexpected error occurred.');
    });
  });
});
