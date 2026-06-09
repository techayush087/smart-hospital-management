import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
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

  hasRole(role: User['role']): boolean {
    return this.currentUser()?.role === role;
  }

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }
}
