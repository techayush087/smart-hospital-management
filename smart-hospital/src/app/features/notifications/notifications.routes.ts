import { Routes } from '@angular/router';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/notification-list/notification-list.component').then(
        (m) => m.NotificationListComponent,
      ),
  },
];
