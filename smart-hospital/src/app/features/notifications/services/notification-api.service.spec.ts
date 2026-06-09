import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NotificationApiService } from './notification-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models';
import { environment } from '../../../../environments/environment';

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    userId: 'u1',
    type: 'confirmation',
    title: 'Appointment confirmed',
    message: 'Your appointment is confirmed.',
    read: false,
    createdAt: '2026-05-20T09:00:00.000Z',
    ...overrides,
  };
}

describe('NotificationApiService', () => {
  let service: NotificationApiService;
  let store: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationApiService,
        NotificationService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(NotificationApiService);
    store = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('load(userId) GETs /notifications?userId=u1 and sets the store signal', () => {
    service.load('u1').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/notifications`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('userId')).toBe('u1');

    req.flush([
      makeNotification({ id: 'n1' }),
      makeNotification({ id: 'n2' }),
    ]);

    expect(store.getNotifications()().length).toBe(2);
  });

  it('markRead(id) PATCHes /notifications/n1 with {read:true} and marks the store read', () => {
    store.setNotifications([
      makeNotification({ id: 'n1', read: false }),
      makeNotification({ id: 'n2', read: false }),
    ]);

    service.markRead('n1').subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/notifications/n1`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ read: true });
    req.flush(makeNotification({ id: 'n1', read: true }));

    const n1 = store.getNotifications()().find((n) => n.id === 'n1');
    expect(n1?.read).toBe(true);
  });
});
