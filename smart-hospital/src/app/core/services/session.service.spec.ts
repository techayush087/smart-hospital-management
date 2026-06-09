import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setToken then getToken returns the stored token', () => {
    service.setToken('jwt-abc-123');
    expect(service.getToken()).toBe('jwt-abc-123');
  });

  it('getToken returns null when no token is set', () => {
    expect(service.getToken()).toBeNull();
  });

  it('clear removes the token so getToken returns null', () => {
    service.setToken('jwt-abc-123');
    service.clear();
    expect(service.getToken()).toBeNull();
  });

  it('persists the token under the sessionStorage key', () => {
    service.setToken('jwt-key-check');
    expect(sessionStorage.getItem('shapms.token')).toBe('jwt-key-check');
  });
});
