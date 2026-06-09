import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { handleApiError } from '../../shared/utils/http.utils';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        auth.logout();
        router.navigate(['/auth/login']);
      } else if (err.status === 403) {
        router.navigate(['/']);
      }
      notify.addNotification({
        id: `err-${Date.now()}`,
        userId: '',
        type: 'admin-alert',
        title: 'Error',
        message: handleApiError(err),
        read: false,
        createdAt: new Date().toISOString(),
      });
      return throwError(() => err);
    }),
  );
};
