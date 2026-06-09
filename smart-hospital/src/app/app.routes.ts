import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Auth screens render full-bleed (no shell).
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },

  // All authenticated screens render inside the app shell (top bar + sidebar).
  {
    path: '',
    loadComponent: () => import('./shared/components/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: 'doctors', canActivate: [authGuard], loadChildren: () => import('./features/doctors/doctors.routes').then((m) => m.DOCTORS_ROUTES) },
      { path: 'appointments', canActivate: [authGuard], loadChildren: () => import('./features/appointment/appointment.routes').then((m) => m.APPOINTMENT_ROUTES) },
      { path: 'patient', canActivate: [authGuard, roleGuard], data: { roles: ['customer'] }, loadChildren: () => import('./features/patient/patient.routes').then((m) => m.PATIENT_ROUTES) },
      { path: 'notifications', canActivate: [authGuard], loadChildren: () => import('./features/notifications/notifications.routes').then((m) => m.NOTIFICATIONS_ROUTES) },
      { path: 'admin', canActivate: [authGuard, roleGuard], data: { roles: ['admin'] }, loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES) },
    ],
  },

  { path: '**', loadComponent: () => import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent) },
];
