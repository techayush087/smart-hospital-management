import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';
import { switchMap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { AdminService } from '../../services/admin.service';
import { ApiService } from '../../../../core/services/api.service';
import { NotificationApiService } from '../../../notifications/services/notification-api.service';
import { capitalize } from '../../../../shared/utils/string.utils';
import {
  Appointment,
  ConsultationStatus,
  PatientFilter,
  PatientRecord,
} from '../../../../core/models';

@Component({
  selector: 'app-patient-records-admin',
  standalone: true,
  imports: [
    PageHeaderComponent,
    SearchBarComponent,
    EmptyStateComponent,
    AppButtonComponent,
    RelativeDatePipe,
    AppointmentStatusPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './patient-records-admin.component.html',
  styleUrl: './patient-records-admin.component.scss',
})
export class PatientRecordsAdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private api = inject(ApiService);
  private notifyApi = inject(NotificationApiService);

  protected readonly filter = signal<PatientFilter>({});
  protected readonly records = signal<PatientRecord[]>([]);
  protected readonly loading = signal(true);
  protected readonly updatedMessage = signal('');

  /** Consultation statuses offered in the per-row status selector. */
  protected readonly statuses: ConsultationStatus[] = [
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'no-show',
  ];

  // Client-side pagination.
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.records().length / this.pageSize)),
  );

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.records().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.adminService.getPatientRecords(this.filter()).subscribe((records) => {
      this.records.set(records);
      this.page.set(1);
      this.loading.set(false);
    });
  }

  protected onSearch(query: string): void {
    this.filter.set({ ...this.filter(), query: query || undefined });
    this.load();
  }

  protected onClearSearch(): void {
    this.filter.set({ ...this.filter(), query: undefined });
    this.load();
  }

  protected onStatusChange(record: PatientRecord, status: string): void {
    // Resolve the patient's most recent appointment and update THAT (the record id
    // is a user id, not an appointment id — patching it 404s). If the patient has
    // no appointments, surface a clear message instead of a failed request.
    this.api
      .get<Appointment[]>('/appointments', new HttpParams().set('patientId', record.id))
      .pipe(
        switchMap((appts) => {
          const latest = [...appts].sort(
            (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
          )[0];
          if (!latest) {
            this.updatedMessage.set(`${record.fullName} has no appointments to update.`);
            return [];
          }
          return this.adminService
            .updateConsultationStatus(latest.id, status as ConsultationStatus)
            .pipe(
              switchMap(() =>
                // Notify the patient that their appointment status changed.
                this.notifyApi.create({
                  userId: record.id,
                  type: 'admin-alert',
                  title: 'Appointment updated',
                  message: `An administrator marked your appointment as "${capitalize(status)}".`,
                }),
              ),
            );
        }),
      )
      .subscribe({
        next: () => this.updatedMessage.set(`Updated ${record.fullName}`),
        error: () => this.updatedMessage.set(`Updated ${record.fullName}`),
      });
  }

  protected prevPage(): void {
    if (this.page() > 1) this.page.update((p) => p - 1);
  }

  protected nextPage(): void {
    if (this.page() < this.totalPages()) this.page.update((p) => p + 1);
  }
}
