import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NotificationListComponent } from './notification-list.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Notification } from '../../../../core/models';
import { environment } from '../../../../../environments/environment';

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

const authStub = {
  getCurrentUser: () => () => ({ id: 'u1', role: 'customer' }),
};

describe('NotificationListComponent', () => {
  let fixture: ComponentFixture<NotificationListComponent>;
  let store: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationListComponent],
      providers: [
        NotificationService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationListComponent);
    store = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads notifications for the current user and renders an item per notification', () => {
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/notifications`,
    );
    expect(req.request.params.get('userId')).toBe('u1');
    req.flush([
      makeNotification({ id: 'n1' }),
      makeNotification({ id: 'n2' }),
    ]);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll(
      '[data-cy="notification-item"]',
    );
    expect(items.length).toBe(2);
  });

  it('shows the empty state when there are no notifications', () => {
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/notifications`,
    );
    req.flush([]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('No notifications');
    const items = fixture.nativeElement.querySelectorAll(
      '[data-cy="notification-item"]',
    );
    expect(items.length).toBe(0);
  });

  it('marks all as read, dropping the unread count to 0', () => {
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.apiUrl}/notifications`,
    );
    req.flush([
      makeNotification({ id: 'n1', read: false }),
      makeNotification({ id: 'n2', read: false }),
    ]);
    fixture.detectChanges();

    expect(store.unreadCount()).toBe(2);

    const button: HTMLElement = fixture.nativeElement.querySelector(
      'app-button button',
    );
    button.click();
    fixture.detectChanges();

    expect(store.unreadCount()).toBe(0);

    // markAllRead PATCHes each previously-unread notification.
    const patches = httpMock.match(
      (r) =>
        r.method === 'PATCH' &&
        r.url.startsWith(`${environment.apiUrl}/notifications/`),
    );
    expect(patches.length).toBe(2);
    patches.forEach((p) => p.flush(makeNotification({ read: true })));
  });
});
