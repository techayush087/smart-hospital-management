import { Routes } from '@angular/router';
import { provideAppointmentCatalog } from '../../store/appointment-catalog';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    providers: [provideAppointmentCatalog()],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './components/patient-dashboard/patient-dashboard.component'
          ).then((m) => m.PatientDashboardComponent),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./components/visit-history/visit-history.component').then(
            (m) => m.VisitHistoryComponent,
          ),
      },
      {
        path: 'prescriptions',
        loadComponent: () =>
          import(
            './components/prescription-view/prescription-view.component'
          ).then((m) => m.PrescriptionViewComponent),
      },
      {
        path: 'timeline',
        loadComponent: () =>
          import(
            './components/medical-timeline/medical-timeline.component'
          ).then((m) => m.MedicalTimelineComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
