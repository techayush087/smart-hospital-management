import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'schedules',
    loadComponent: () =>
      import('./components/schedule-manager/schedule-manager.component').then(
        (m) => m.ScheduleManagerComponent,
      ),
  },
  {
    path: 'records',
    loadComponent: () =>
      import(
        './components/patient-records-admin/patient-records-admin.component'
      ).then((m) => m.PatientRecordsAdminComponent),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./components/reports/reports.component').then(
        (m) => m.ReportsComponent,
      ),
  },
  {
    path: 'prescriptions',
    loadComponent: () =>
      import(
        './components/prescription-editor/prescription-editor.component'
      ).then((m) => m.PrescriptionEditorComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];
