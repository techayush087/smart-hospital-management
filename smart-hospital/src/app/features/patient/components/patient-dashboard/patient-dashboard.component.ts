import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
  loadAppointmentCatalog,
  selectUpcomingAppointments,
} from '../../../../store/appointment-catalog';
import { Appointment } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PatientRecordsService } from '../../services/patient-records.service';
import { AppBadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AppAvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    AppBadgeComponent,
    AppAvatarComponent,
    RelativeDatePipe,
    AppointmentStatusPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss',
})
export class PatientDashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly records = inject(PatientRecordsService);
  private readonly notifications = inject(NotificationService);

  protected readonly upcoming = toSignal(
    this.store.select(selectUpcomingAppointments),
    { initialValue: [] as Appointment[] },
  );
  protected readonly nextAppointment = computed(() => this.upcoming()[0] ?? null);

  protected readonly totalVisits = signal(0);
  protected readonly activePrescriptions = signal(0);
  protected readonly unreadCount = this.notifications.unreadCount;
  protected readonly loading = signal(true);

  private readonly currentUser = this.auth.getCurrentUser();
  protected readonly firstName = computed(() => this.currentUser()?.firstName ?? 'there');

  private readonly patientId = this.currentUser()?.id ?? '';

  ngOnInit(): void {
    this.store.dispatch(loadAppointmentCatalog());
    if (!this.patientId) {
      this.loading.set(false);
      return;
    }

    let pending = 2;
    const done = (): void => {
      if (--pending === 0) this.loading.set(false);
    };

    this.records.getVisitHistory(this.patientId).subscribe({
      next: (visits) => this.totalVisits.set(visits.length),
      error: done,
      complete: done,
    });
    this.records.getPrescriptions(this.patientId).subscribe({
      next: (list) => this.activePrescriptions.set(list.length),
      error: done,
      complete: done,
    });
  }

  goToDoctors(): void {
    this.router.navigate(['/doctors']);
  }

  goToHistory(): void {
    this.router.navigate(['/patient/history']);
  }

  goToPrescriptions(): void {
    this.router.navigate(['/patient/prescriptions']);
  }
}
