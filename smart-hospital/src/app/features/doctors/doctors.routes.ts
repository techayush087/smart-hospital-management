import { Routes } from '@angular/router';
import { provideAppointmentCatalog } from '../../store/appointment-catalog';

export const DOCTORS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideAppointmentCatalog()],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/doctor-list/doctor-list.component').then(
            (m) => m.DoctorListComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/doctor-detail/doctor-detail.component').then(
            (m) => m.DoctorDetailComponent,
          ),
      },
    ],
  },
];
