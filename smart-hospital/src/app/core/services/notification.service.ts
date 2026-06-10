import { Injectable, signal, computed } from '@angular/core';
import { Notification } from '../models';

/** Window in which a toast with identical content is treated as a duplicate. */
const TOAST_DEDUPE_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  /** Persisted inbox notifications — backs the bell count AND the notifications page. */
  private notifications = signal<Notification[]>([]);
  /** Ephemeral toasts (e.g. API errors). Shown briefly but NOT counted in the bell
   *  and NOT part of the inbox, so a transient error never inflates the unread badge. */
  private transient = signal<Notification[]>([]);

  /** Recently-shown toast content keys → timestamp, to drop near-duplicate toasts
   *  (e.g. the instant effect toast + the same notification arriving via polling). */
  private recentToastKeys = new Map<string, number>();

  readonly unreadCount = computed(
    () => this.notifications().filter((n) => !n.read).length,
  );

  /** ONLY transient toasts feed the popup outlet. Persisted notifications live in
   *  the bell/inbox; polling re-surfaces genuinely new ones as transient toasts.
   *  Rendering the inbox here too would double-show every notification. */
  readonly toasts = this.transient.asReadonly();

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

  /** Show a transient toast that does NOT affect the bell count or the inbox.
   *  Drops a toast whose content was already shown in the last 30s, so the same
   *  notification toasted instantly by an effect and again when polling fetches
   *  its persisted copy (different ids) only pops once. */
  addTransient(n: Notification): void {
    const key = `${n.userId}|${n.type}|${n.title}|${n.message}`;
    const now = Date.now();
    const last = this.recentToastKeys.get(key);
    if (last !== undefined && now - last < TOAST_DEDUPE_MS) return;
    this.recentToastKeys.set(key, now);
    this.pruneRecentKeys(now);
    this.transient.update((list) => [n, ...list]);
  }

  /** Forget dedupe keys older than the window so the map can't grow unbounded. */
  private pruneRecentKeys(now: number): void {
    for (const [key, ts] of this.recentToastKeys) {
      if (now - ts >= TOAST_DEDUPE_MS) this.recentToastKeys.delete(key);
    }
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
