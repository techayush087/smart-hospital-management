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
  cancelAppointment,
  loadAppointmentCatalog,
  selectPastAppointments,
  selectUpcomingAppointments,
} from '../../../../store/appointment-catalog';
import { Appointment } from '../../../../core/models';
import { AppBadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RescheduleModalComponent } from '../reschedule-modal/reschedule-modal.component';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    RouterLink,
    AppBadgeComponent,
    AppButtonComponent,
    EmptyStateComponent,
    RescheduleModalComponent,
    RelativeDatePipe,
    AppointmentStatusPipe,
    PaginatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css',
})
export class AppointmentListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  protected readonly upcoming = toSignal(
    this.store.select(selectUpcomingAppointments),
    { initialValue: [] as Appointment[] },
  );
  protected readonly past = toSignal(
    this.store.select(selectPastAppointments),
    { initialValue: [] as Appointment[] },
  );

  protected readonly pastPage = signal(1);
  protected readonly pageSize = 10;
  protected readonly pastPaged = computed(() => {
    const start = (this.pastPage() - 1) * this.pageSize;
    return this.past().slice(start, start + this.pageSize);
  });

  goToPastPage(p: number): void {
    this.pastPage.set(p);
  }

  protected readonly rescheduling = signal<Appointment | null>(null);

  ngOnInit(): void {
    this.store.dispatch(loadAppointmentCatalog());
  }

  canManage(a: Appointment): boolean {
    return a.status !== 'cancelled' && a.status !== 'completed';
  }

  onCancel(a: Appointment): void {
    this.store.dispatch(cancelAppointment({ appointmentId: a.id }));
  }

  onReschedule(a: Appointment): void {
    this.rescheduling.set(a);
  }

  onRescheduleClosed(): void {
    this.rescheduling.set(null);
  }

  onBook(): void {
    this.router.navigate(['/doctors']);
  }
}
