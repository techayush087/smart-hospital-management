import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, timer } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { NotificationApiService } from '../../features/notifications/services/notification-api.service';
import { Notification } from '../models';

const POLL_INTERVAL_MS = 25_000;

/**
 * Smart notification polling — keeps the bell + toasts current WITHOUT a constant
 * server load (important on free Render, which sleeps when idle):
 *  - Polls /notifications only while the browser tab is VISIBLE.
 *  - Pauses immediately on tab blur (visibilitychange), resumes + fetches on focus.
 *  - Surfaces newly-arrived unread notifications as transient toasts so the user
 *    gets a popup for things done to them by someone else (e.g. admin actions).
 *
 * One instance, started once from the shell after login.
 */
@Injectable({ providedIn: 'root' })
export class NotificationPollService {
  private auth = inject(AuthService);
  private store = inject(NotificationService);
  private api = inject(NotificationApiService);
  private destroyRef = inject(DestroyRef);

  private pollSub: Subscription | null = null;
  private started = false;
  private seenIds = new Set<string>();
  private visibilityHandler = (): void => this.onVisibilityChange();

  /** Begin polling for the current user. Safe to call once per session. */
  start(): void {
    if (this.started) return;
    this.started = true;

    // Seed the "seen" set with whatever's already loaded so we don't re-toast it.
    for (const n of this.store.getNotifications()()) this.seenIds.add(n.id);

    document.addEventListener('visibilitychange', this.visibilityHandler);
    this.destroyRef.onDestroy(() => {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.stopPolling();
    });

    if (document.visibilityState === 'visible') this.startPolling();
  }

  private onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.fetchOnce(); // immediate catch-up on return
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  private startPolling(): void {
    if (this.pollSub) return;
    // timer(0, interval) fires immediately then every interval while subscribed.
    this.pollSub = timer(POLL_INTERVAL_MS, POLL_INTERVAL_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.fetchOnce());
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }

  private fetchOnce(): void {
    const userId = this.auth.getCurrentUser()()?.id;
    if (!userId) return;
    this.api.load(userId).subscribe({
      next: (list) => this.toastNew(list),
      error: () => undefined, // a failed poll (e.g. server waking) is non-fatal
    });
  }

  /** Toast any unread notification we haven't seen before this session. */
  private toastNew(list: Notification[]): void {
    for (const n of list) {
      if (this.seenIds.has(n.id)) continue;
      this.seenIds.add(n.id);
      if (!n.read) this.store.addTransient(n);
    }
  }
}
