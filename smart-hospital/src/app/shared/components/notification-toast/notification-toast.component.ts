import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Notification } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';

const TOAST_DURATION_MS = 4000;
const MAX_VISIBLE = 3;

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-toast.component.html',
  styleUrl: './notification-toast.component.scss',
})
export class NotificationToastComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly notifications = this.notificationService.getNotifications();

  // Ids the user (or the auto-dismiss timer) has closed locally.
  private readonly dismissed = signal<Set<string>>(new Set());

  // Tracks which ids already have a running auto-dismiss timer.
  private readonly scheduled = new Set<string>();

  protected readonly toasts = computed<Notification[]>(() => {
    const dismissed = this.dismissed();
    return this.notifications()
      .filter((n) => !n.read && !dismissed.has(n.id))
      .slice(0, MAX_VISIBLE);
  });

  constructor() {
    // Schedule a one-shot auto-dismiss timer for each newly visible toast.
    effect(() => {
      for (const toast of this.toasts()) {
        if (this.scheduled.has(toast.id)) continue;
        this.scheduled.add(toast.id);
        setTimeout(() => this.dismiss(toast.id), TOAST_DURATION_MS);
      }
    });
  }

  dismiss(id: string): void {
    this.dismissed.update((set) => {
      const next = new Set(set);
      next.add(id);
      return next;
    });
  }

  protected borderClass(type: Notification['type']): string {
    switch (type) {
      case 'confirmation':
        return 'app-notification-toast__item--success';
      case 'cancellation':
        return 'app-notification-toast__item--danger';
      case 'reschedule':
        return 'app-notification-toast__item--primary';
      case 'admin-alert':
        return 'app-notification-toast__item--warning';
      case 'reminder':
      default:
        return 'app-notification-toast__item--info';
    }
  }
}
