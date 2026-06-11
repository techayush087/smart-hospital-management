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
import { TimelineEvent } from '../../../../core/models';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AppBadgeComponent } from '../../../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-medical-timeline',
  standalone: true,
  imports: [
    PageHeaderComponent,
    AppBadgeComponent,
    EmptyStateComponent,
    RelativeDatePipe,
    AppointmentStatusPipe,
    PaginatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './medical-timeline.component.html',
  styleUrl: './medical-timeline.component.css',
})
export class MedicalTimelineComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly records = inject(PatientRecordsService);

  protected readonly events = signal<TimelineEvent[]>([]);
  protected readonly loading = signal(true);

  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.events().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    const patientId = this.auth.getCurrentUser()()?.id ?? '';
    if (!patientId) {
      this.loading.set(false);
      return;
    }
    this.records.getMedicalTimeline(patientId).subscribe({
      next: (list) => {
        this.events.set(list);
        this.page.set(1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(p: number): void {
    this.page.set(p);
  }
}
