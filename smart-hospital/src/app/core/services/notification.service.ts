import { Injectable, signal, computed } from '@angular/core';
import { Notification } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = signal<Notification[]>([]);

  readonly unreadCount = computed(
    () => this.notifications().filter((n) => !n.read).length,
  );

  getNotifications() {
    return this.notifications.asReadonly();
  }

  setNotifications(list: Notification[]): void {
    this.notifications.set(list);
  }

  addNotification(n: Notification): void {
    this.notifications.update((list) => [n, ...list]);
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
