import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NotificationApiService } from '../../services/notification-api.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { NotificationItemComponent } from '../notification-item/notification-item.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    AppButtonComponent,
    EmptyStateComponent,
    NotificationItemComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
})
export class NotificationListComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly store = inject(NotificationService);
  private readonly notificationApi = inject(NotificationApiService);

  protected readonly notifications = this.store.getNotifications();
  protected readonly unreadCount = this.store.unreadCount;

  ngOnInit(): void {
    const userId = this.auth.getCurrentUser()()?.id ?? '';
    if (!userId) return;
    this.notificationApi.load(userId).subscribe();
  }

  onRead(id: string): void {
    this.notificationApi.markRead(id).subscribe();
  }

  markAllRead(): void {
    const unreadIds = this.notifications()
      .filter((n) => !n.read)
      .map((n) => n.id);
    this.store.markAllAsRead();
    for (const id of unreadIds) {
      this.notificationApi.markRead(id).subscribe();
    }
  }
}
