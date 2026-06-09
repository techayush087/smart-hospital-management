import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

const route = {} as ActivatedRouteSnapshot;
const state = {} as RouterStateSnapshot;

function configure(authenticated: boolean): void {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: AuthService,
        useValue: { isAuthenticated: () => authenticated },
      },
    ],
  });
}

describe('authGuard', () => {
  it('allows activation when authenticated', () => {
    configure(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state),
    );
    expect(result).toBe(true);
  });

  it('returns a UrlTree to the login page when not authenticated', () => {
    configure(false);
    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state),
    );
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/auth/login');
  });
});
