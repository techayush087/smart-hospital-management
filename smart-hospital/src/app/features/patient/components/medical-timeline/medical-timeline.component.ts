import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
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

@Component({
  selector: 'app-medical-timeline',
  standalone: true,
  imports: [
    PageHeaderComponent,
    AppBadgeComponent,
    EmptyStateComponent,
    RelativeDatePipe,
    AppointmentStatusPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './medical-timeline.component.html',
  styleUrl: './medical-timeline.component.scss',
})
export class MedicalTimelineComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly records = inject(PatientRecordsService);

  protected readonly events = signal<TimelineEvent[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    const patientId = this.auth.getCurrentUser()()?.id ?? '';
    if (!patientId) {
      this.loading.set(false);
      return;
    }
    this.records.getMedicalTimeline(patientId).subscribe({
      next: (list) => {
        this.events.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
