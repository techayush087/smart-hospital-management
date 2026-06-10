import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { PatientRecordsService } from '../../services/patient-records.service';
import { VisitRecord } from '../../../../core/models';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AppBadgeComponent } from '../../../../shared/components/badge/badge.component';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-visit-history',
  standalone: true,
  imports: [
    PageHeaderComponent,
    AppBadgeComponent,
    PaginatorComponent,
    EmptyStateComponent,
    RelativeDatePipe,
    AppointmentStatusPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visit-history.component.html',
  styleUrl: './visit-history.component.scss',
})
export class VisitHistoryComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly records = inject(PatientRecordsService);

  protected readonly visits = signal<VisitRecord[]>([]);
  protected readonly loading = signal(true);
  protected readonly page = signal(1);
  protected readonly pageSize = PAGE_SIZE;

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.visits().length / PAGE_SIZE)),
  );
  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.visits().slice(start, start + PAGE_SIZE);
  });

  ngOnInit(): void {
    const patientId = this.auth.getCurrentUser()()?.id ?? '';
    if (!patientId) {
      this.loading.set(false);
      return;
    }
    this.records.getVisitHistory(patientId).subscribe({
      next: (list) => {
        this.visits.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(p: number): void {
    this.page.set(p);
  }
}
