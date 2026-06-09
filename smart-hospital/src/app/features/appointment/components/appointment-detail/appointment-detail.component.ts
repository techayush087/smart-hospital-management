import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
  cancelAppointment,
  loadAppointmentCatalog,
  selectAllAppointments,
} from '../../../../store/appointment-catalog';
import { Appointment } from '../../../../core/models';
import { AppBadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RescheduleModalComponent } from '../reschedule-modal/reschedule-modal.component';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';
import { minutesToDurationString } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    RouterLink,
    AppBadgeComponent,
    AppButtonComponent,
    EmptyStateComponent,
    RescheduleModalComponent,
    AppointmentStatusPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './appointment-detail.component.html',
  styleUrl: './appointment-detail.component.scss',
})
export class AppointmentDetailComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  private readonly appointmentId =
    this.route.snapshot.paramMap.get('id') ?? '';

  private readonly all = toSignal(
    this.store.select(selectAllAppointments),
    { initialValue: [] as Appointment[] },
  );

  protected readonly appointment = computed<Appointment | null>(
    () => this.all().find((a) => a.id === this.appointmentId) ?? null,
  );

  protected readonly rescheduling = signal(false);

  ngOnInit(): void {
    this.store.dispatch(loadAppointmentCatalog());
  }

  canManage(a: Appointment): boolean {
    return a.status !== 'cancelled' && a.status !== 'completed';
  }

  formatWhen(value: string): string {
    return new Date(value).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  formatDuration(minutes: number): string {
    return minutesToDurationString(minutes);
  }

  onCancel(a: Appointment): void {
    this.store.dispatch(cancelAppointment({ appointmentId: a.id }));
  }

  onReschedule(): void {
    this.rescheduling.set(true);
  }

  onRescheduleClosed(): void {
    this.rescheduling.set(false);
  }
}
