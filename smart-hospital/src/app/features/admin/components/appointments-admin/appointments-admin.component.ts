import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { AppBadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AppAvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator.component';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';
import { TimeSlotPipe } from '../../../../shared/pipes/time-slot.pipe';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';
import { AdminService } from '../../services/admin.service';
import { NotificationApiService } from '../../../notifications/services/notification-api.service';
import { AdminAppointment, AppointmentStatus, ConsultationStatus } from '../../../../core/models';
import { capitalize } from '../../../../shared/utils/string.utils';

const STATUSES: AppointmentStatus[] = [
  'pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no-show',
];

@Component({
  selector: 'app-appointments-admin',
  standalone: true,
  imports: [
    PageHeaderComponent,
    SearchBarComponent,
    EmptyStateComponent,
    AppBadgeComponent,
    AppAvatarComponent,
    PaginatorComponent,
    RelativeDatePipe,
    TimeSlotPipe,
    AppointmentStatusPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './appointments-admin.component.html',
  styleUrl: './appointments-admin.component.scss',
})
export class AppointmentsAdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private notifyApi = inject(NotificationApiService);
  private router = inject(Router);

  protected readonly statuses = STATUSES;
  protected readonly pageSize = 10;
  protected readonly appointments = signal<AdminAppointment[]>([]);
  protected readonly loading = signal(true);
  protected readonly query = signal('');
  protected readonly statusFilter = signal<AppointmentStatus | 'all'>('all');
  protected readonly updatedMessage = signal('');
  protected readonly page = signal(1);

  /** Number of appointments awaiting confirmation — drives the Requests badge. */
  protected readonly pendingCount = computed(
    () => this.appointments().filter((a) => a.status === 'pending').length,
  );

  protected readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const status = this.statusFilter();
    return this.appointments().filter((a) => {
      const matchesStatus = status === 'all' || a.status === status;
      const matchesQuery =
        !q ||
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  });

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.load();
  }

  protected goToPage(p: number): void {
    this.page.set(p);
  }

  /** Confirm a pending request (status -> confirmed) and notify the patient. */
  protected confirm(appt: AdminAppointment): void {
    this.onStatusChange(appt, 'confirmed');
  }
  /** Decline a pending request (status -> cancelled) and notify the patient. */
  protected decline(appt: AdminAppointment): void {
    this.onStatusChange(appt, 'cancelled');
  }

  private load(): void {
    this.loading.set(true);
    this.adminService.getAllAppointments().subscribe({
      next: (list) => {
        this.appointments.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onSearch(q: string): void {
    this.query.set(q);
    this.page.set(1);
  }

  protected onClearSearch(): void {
    this.query.set('');
    this.page.set(1);
  }

  protected setStatusFilter(status: AppointmentStatus | 'all'): void {
    this.statusFilter.set(status);
    this.page.set(1);
  }

  protected onStatusChange(appt: AdminAppointment, status: string): void {
    this.updatedMessage.set('');
    this.adminService
      .updateConsultationStatus(appt.id, status as ConsultationStatus)
      .pipe(
        switchMap(() =>
          // Notify the patient that their appointment status changed.
          this.notifyApi.create({
            userId: appt.patientId,
            type: 'admin-alert',
            title: 'Appointment updated',
            message: `Your appointment with ${appt.doctorName} is now "${capitalize(status)}".`,
          }),
        ),
      )
      .subscribe({
        next: () => {
          this.appointments.update((list) =>
            list.map((a) =>
              a.id === appt.id ? { ...a, status: status as AppointmentStatus } : a,
            ),
          );
          this.updatedMessage.set(`Updated ${appt.patientName}'s appointment.`);
        },
        error: () => this.updatedMessage.set('Could not update. Please try again.'),
      });
  }

  protected prescribe(appt: AdminAppointment): void {
    this.router.navigate(['/admin/prescriptions'], {
      queryParams: { patientId: appt.patientId, appointmentId: appt.id },
    });
  }
}
