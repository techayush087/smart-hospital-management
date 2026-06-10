import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { errorHandlerInterceptor } from './error-handler.interceptor';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

describe('errorHandlerInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;
  let notify: NotificationService;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = { navigate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorHandlerInterceptor])),
        provideHttpClientTesting(),
        AuthService,
        NotificationService,
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    notify = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('logs out and redirects to login on a 401, with a transient toast (not an inbox item)', () => {
    const logoutSpy = vi.spyOn(auth, 'logout');

    http.get('/api/secure').subscribe({
      next: () => expect.fail('expected an error'),
      error: (err) => expect(err.status).toBe(401),
    });

    httpMock
      .expectOne('/api/secure')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(logoutSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    // Error shows as a transient toast but must NOT inflate the inbox/bell.
    expect(notify.getNotifications()().length).toBe(0);
    expect(notify.unreadCount()).toBe(0);
    expect(notify.toasts().length).toBe(1);
  });

  it('redirects to home on a 403 without logging out', () => {
    const logoutSpy = vi.spyOn(auth, 'logout');

    http.get('/api/forbidden').subscribe({
      next: () => expect.fail('expected an error'),
      error: (err) => expect(err.status).toBe(403),
    });

    httpMock
      .expectOne('/api/forbidden')
      .flush(null, { status: 403, statusText: 'Forbidden' });

    expect(logoutSpy).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(notify.unreadCount()).toBe(0);
    expect(notify.toasts().length).toBe(1);
  });

  it('shows a transient toast for other errors without navigating', () => {
    http.get('/api/boom').subscribe({
      next: () => expect.fail('expected an error'),
      error: (err) => expect(err.status).toBe(500),
    });

    httpMock
      .expectOne('/api/boom')
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(router.navigate).not.toHaveBeenCalled();
    expect(notify.unreadCount()).toBe(0);
    expect(notify.toasts().length).toBe(1);
  });

  it('does NOT toast on auth endpoint errors (handled inline on the form)', () => {
    http.post('/api/auth/login', {}).subscribe({
      next: () => expect.fail('expected an error'),
      error: (err) => expect(err.status).toBe(400),
    });

    httpMock
      .expectOne('/api/auth/login')
      .flush(null, { status: 400, statusText: 'Bad Request' });

    expect(notify.toasts().length).toBe(0);
  });
});
