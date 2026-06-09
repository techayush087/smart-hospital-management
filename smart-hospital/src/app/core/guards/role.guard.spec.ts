import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { provideRouter } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

const state = {} as RouterStateSnapshot;

function configure(role: string | null): void {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: AuthService,
        useValue: {
          getCurrentUser: () => () => (role ? { role } : null),
        },
      },
    ],
  });
}

describe('roleGuard', () => {
  it('allows activation when the user role is in the allowed list', () => {
    configure('admin');
    const route = {
      data: { roles: ['admin'] },
    } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(route, state),
    );
    expect(result).toBe(true);
  });

  it('returns a UrlTree to home when the user role is not allowed', () => {
    configure('customer');
    const route = {
      data: { roles: ['admin'] },
    } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(route, state),
    );
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/');
  });

  it('returns a UrlTree when there is no authenticated user', () => {
    configure(null);
    const route = {
      data: { roles: ['admin'] },
    } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(route, state),
    );
    expect(result instanceof UrlTree).toBe(true);
  });
});
