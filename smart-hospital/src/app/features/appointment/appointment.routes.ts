import { Routes } from '@angular/router';
import { provideAppointmentCatalog } from '../../store/appointment-catalog';

export const APPOINTMENT_ROUTES: Routes = [
  {
    path: '',
    providers: [provideAppointmentCatalog()],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/appointment-list/appointment-list.component').then(
            (m) => m.AppointmentListComponent,
          ),
      },
      {
        path: 'book/:docId',
        loadComponent: () =>
          import('./components/booking-wizard/booking-wizard.component').then(
            (m) => m.BookingWizardComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/appointment-detail/appointment-detail.component').then(
            (m) => m.AppointmentDetailComponent,
          ),
      },
    ],
  },
];
