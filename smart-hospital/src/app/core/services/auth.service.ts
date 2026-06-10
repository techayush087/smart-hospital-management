import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { SessionService } from './session.service';
import { User, LoginDto, RegisterDto, AuthResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private session = inject(SessionService);
  private currentUser = signal<User | null>(null);

  readonly isAuthenticated = computed(() => !!this.currentUser());

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', credentials).pipe(
      tap((res) => {
        this.session.setToken(res.accessToken);
        this.currentUser.set(res.user);
      }),
    );
  }

  register(data: RegisterDto): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', data).pipe(
      tap((res) => {
        this.session.setToken(res.accessToken);
        this.currentUser.set(res.user);
      }),
    );
  }

  logout(): void {
    this.session.clear();
    this.currentUser.set(null);
  }

  /**
   * Step 1 of password reset — request a reset. Always resolves the same way
   * regardless of whether the account exists (no user enumeration). In this mock
   * backend the response carries a dev-only `devToken` standing in for the link
   * that a real backend would email out-of-band.
   */
  requestPasswordReset(email: string): Observable<{ message: string; devToken?: string }> {
    return this.api.post<{ message: string; devToken?: string }>('/auth/forgot-password', { email });
  }

  /** Step 2 of password reset — set a new password using the single-use token. */
  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/reset-password', { token, password });
  }

  hasRole(role: User['role']): boolean {
    return this.currentUser()?.role === role;
  }

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  /**
   * Restore the signed-in user from a persisted token on app start (e.g. after a
   * page refresh). Decodes the JWT for the user id, then fetches the full record so
   * the shell can render role-based nav + the user menu. No token → no-op.
   */
  restoreSession(): Observable<User | null> {
    const token = this.session.getToken();
    if (!token) return of(null);
    const userId = this.decodeUserId(token);
    if (!userId) {
      this.session.clear();
      return of(null);
    }
    return this.api.get<User>(`/users/${userId}`).pipe(
      tap((user) => this.currentUser.set(user)),
      catchError(() => {
        this.session.clear();
        return of(null);
      }),
    );
  }

  private decodeUserId(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const claims = JSON.parse(json) as { sub?: string };
      return claims.sub ?? null;
    } catch {
      return null;
    }
  }
}
