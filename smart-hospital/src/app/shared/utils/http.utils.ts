import { HttpParams, HttpErrorResponse } from '@angular/common/http';

/** Pure HTTP helper utilities. */

/**
 * Builds `HttpParams` from a flat filter object, skipping `undefined`, `null`,
 * and empty-string values so they are not serialized into the query.
 */
export function buildQueryParams(filters: Record<string, unknown>): HttpParams {
  let p = new HttpParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && v !== '') {
      p = p.set(k, String(v));
    }
  }
  return p;
}

/** Derives a user-facing message from an HttpErrorResponse. */
export function handleApiError(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Network error. Check your connection.';
  }
  return error.error?.message || error.message || 'An unexpected error occurred.';
}
