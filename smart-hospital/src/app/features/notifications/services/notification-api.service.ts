import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models';

type NewNotification = Omit<Notification, 'id' | 'read' | 'createdAt'> &
  Partial<Pick<Notification, 'read' | 'createdAt'>>;

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private api = inject(ApiService);
  private store = inject(NotificationService);

  /** Load a user's persisted notifications into the in-memory store (bell + page). */
  load(userId: string): Observable<Notification[]> {
    return this.api
      .get<Notification[]>('/notifications', new HttpParams().set('userId', userId))
      .pipe(tap((list) => this.store.setNotifications(list)));
  }

  /**
   * Persist a notification targeted at a user (the recipient — usually NOT the
   * current user, e.g. the patient when an admin acts). json-server assigns the id.
   */
  create(notification: NewNotification): Observable<Notification> {
    const payload: Omit<Notification, 'id'> = {
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    };
    return this.api.post<Notification>('/notifications', payload);
  }

  markRead(id: string): Observable<Notification> {
    this.store.markAsRead(id);
    return this.api.patch<Notification>(`/notifications/${id}`, { read: true });
  }
}
