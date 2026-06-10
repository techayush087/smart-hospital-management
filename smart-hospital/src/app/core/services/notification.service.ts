import { Injectable, signal, computed } from '@angular/core';
import { Notification } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  /** Persisted inbox notifications — backs the bell count AND the notifications page. */
  private notifications = signal<Notification[]>([]);
  /** Ephemeral toasts (e.g. API errors). Shown briefly but NOT counted in the bell
   *  and NOT part of the inbox, so a transient error never inflates the unread badge. */
  private transient = signal<Notification[]>([]);

  readonly unreadCount = computed(
    () => this.notifications().filter((n) => !n.read).length,
  );

  /** Inbox + active transient toasts, for the toast outlet to render. */
  readonly toasts = computed(() => [...this.transient(), ...this.notifications()]);

  getNotifications() {
    return this.notifications.asReadonly();
  }

  setNotifications(list: Notification[]): void {
    this.notifications.set(list);
  }

  /** Add a persisted inbox notification (counts toward the bell). */
  addNotification(n: Notification): void {
    this.notifications.update((list) => [n, ...list]);
  }

  /** Show a transient toast that does NOT affect the bell count or the inbox. */
  addTransient(n: Notification): void {
    this.transient.update((list) => [n, ...list]);
  }

  dismissTransient(id: string): void {
    this.transient.update((list) => list.filter((n) => n.id !== id));
  }

  markAsRead(id: string): void {
    this.notifications.update((l) =>
      l.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  markAllAsRead(): void {
    this.notifications.update((l) => l.map((n) => ({ ...n, read: true })));
  }

  clearAll(): void {
    this.notifications.set([]);
  }
}
