import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { Notification } from '../models';

function makeNotification(
  id: string,
  read = false,
  overrides: Partial<Notification> = {},
): Notification {
  return {
    id,
    userId: 'u1',
    type: 'confirmation',
    title: `Title ${id}`,
    message: `Message ${id}`,
    read,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts with an empty list and zero unread', () => {
    expect(service.getNotifications()()).toEqual([]);
    expect(service.unreadCount()).toBe(0);
  });

  it('addNotification prepends and updates the unread count', () => {
    service.addNotification(makeNotification('a', false));
    expect(service.getNotifications()().length).toBe(1);
    expect(service.unreadCount()).toBe(1);

    service.addNotification(makeNotification('b', false));
    expect(service.getNotifications()()[0].id).toBe('b');
    expect(service.unreadCount()).toBe(2);
  });

  it('markAsRead marks a single notification read', () => {
    service.addNotification(makeNotification('a', false));
    expect(service.unreadCount()).toBe(1);

    service.markAsRead('a');
    expect(service.unreadCount()).toBe(0);
    expect(service.getNotifications()()[0].read).toBe(true);
  });

  it('markAllAsRead clears the unread count', () => {
    service.addNotification(makeNotification('a', false));
    service.addNotification(makeNotification('b', false));
    expect(service.unreadCount()).toBe(2);

    service.markAllAsRead();
    expect(service.unreadCount()).toBe(0);
  });

  it('clearAll empties the list', () => {
    service.addNotification(makeNotification('a', false));
    service.clearAll();
    expect(service.getNotifications()().length).toBe(0);
  });

  it('addTransient feeds the toast outlet but not the bell count', () => {
    service.addTransient(makeNotification('t1', false));
    expect(service.toasts().length).toBe(1);
    // Transient toasts never inflate the unread/inbox count.
    expect(service.unreadCount()).toBe(0);
    expect(service.getNotifications()()).toEqual([]);
  });

  it('addTransient drops a duplicate with identical content (effect + poll)', () => {
    // Same content, different ids — the instant effect toast then the persisted
    // copy fetched by polling. Only the first should pop.
    const content = { title: 'Booked', message: 'Awaiting confirmation.' };
    service.addTransient(makeNotification('local-1', false, content));
    service.addTransient(makeNotification('server-uuid', false, content));
    expect(service.toasts().length).toBe(1);

    // Different content is still allowed through.
    service.addTransient(makeNotification('other', false, { title: 'Different' }));
    expect(service.toasts().length).toBe(2);
  });

  it('dismissTransient removes a transient toast', () => {
    service.addTransient(makeNotification('t1', false));
    service.dismissTransient('t1');
    expect(service.toasts().length).toBe(0);
  });

  it('setNotifications replaces the list', () => {
    service.addNotification(makeNotification('a', false));
    service.setNotifications([
      makeNotification('x', true),
      makeNotification('y', false),
    ]);

    const list = service.getNotifications()();
    expect(list.length).toBe(2);
    expect(list.map((n) => n.id)).toEqual(['x', 'y']);
    expect(service.unreadCount()).toBe(1);
  });
});
