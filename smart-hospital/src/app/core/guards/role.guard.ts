import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = (route.data?.['roles'] as string[]) ?? [];
  const user = auth.getCurrentUser()();
  return user && allowed.includes(user.role)
    ? true
    : router.createUrlTree(['/']);
};
