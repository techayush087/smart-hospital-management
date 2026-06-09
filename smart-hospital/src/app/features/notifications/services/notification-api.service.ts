import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private api = inject(ApiService);
  private store = inject(NotificationService);

  load(userId: string): Observable<Notification[]> {
    return this.api
      .get<Notification[]>('/notifications', new HttpParams().set('userId', userId))
      .pipe(tap((list) => this.store.setNotifications(list)));
  }

  markRead(id: string): Observable<Notification> {
    this.store.markAsRead(id);
    return this.api.patch<Notification>(`/notifications/${id}`, { read: true });
  }
}
