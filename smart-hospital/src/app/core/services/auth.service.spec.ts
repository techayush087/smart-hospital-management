import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models';

const mockUser: User = {
  id: 'u1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  role: 'customer',
  dateOfBirth: '1990-01-01',
  phone: '5551234567',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockResponse: AuthResponse = {
  accessToken: 'jwt',
  user: mockUser,
};

describe('AuthService', () => {
  let service: AuthService;
  let session: SessionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    session = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts unauthenticated with no current user', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getCurrentUser()()).toBeNull();
  });

  it('login POSTs credentials, stores token, and sets the current user', () => {
    service
      .login({ email: 'ada@example.com', password: 'secret' })
      .subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'ada@example.com',
      password: 'secret',
    });
    req.flush(mockResponse);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.getCurrentUser()()).toEqual(mockUser);
    expect(session.getToken()).toBe('jwt');
  });

  it('register POSTs data, stores token, and sets the current user', () => {
    service
      .register({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'secret',
        dateOfBirth: '1990-01-01',
        phone: '5551234567',
        role: 'customer',
      })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.isAuthenticated()).toBe(true);
    expect(session.getToken()).toBe('jwt');
  });

  it('hasRole reflects the current user role', () => {
    service.login({ email: 'ada@example.com', password: 'secret' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockResponse);

    expect(service.hasRole('customer')).toBe(true);
    expect(service.hasRole('admin')).toBe(false);
  });

  it('logout clears the session and resets authentication state', () => {
    service.login({ email: 'ada@example.com', password: 'secret' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(mockResponse);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getCurrentUser()()).toBeNull();
    expect(session.getToken()).toBeNull();
  });
});
