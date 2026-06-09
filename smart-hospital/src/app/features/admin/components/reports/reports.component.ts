import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AppCardComponent } from '../../../../shared/components/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { AppBadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';
import { AdminService } from '../../services/admin.service';
import { ReportData } from '../../../../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    PageHeaderComponent,
    AppCardComponent,
    AppButtonComponent,
    AppBadgeComponent,
    AppointmentStatusPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent {
  private adminService = inject(AdminService);

  protected readonly start = signal('');
  protected readonly end = signal('');
  protected readonly loading = signal(false);
  protected readonly report = signal<ReportData | null>(null);

  /** Apply is only actionable once both ends of the range are provided. */
  protected readonly canApply = computed(
    () => this.start().length > 0 && this.end().length > 0,
  );

  /** The largest status count, used to scale the bar widths. */
  protected readonly maxStatusCount = computed(() => {
    const data = this.report();
    if (!data || data.byStatus.length === 0) return 0;
    return Math.max(...data.byStatus.map((b) => b.count));
  });

  protected onStartChange(value: string): void {
    this.start.set(value);
  }

  protected onEndChange(value: string): void {
    this.end.set(value);
  }

  protected apply(): void {
    if (!this.canApply()) return;
    this.loading.set(true);
    this.adminService
      .getAppointmentReport({ start: this.start(), end: this.end() })
      .subscribe((report) => {
        this.report.set(report);
        this.loading.set(false);
      });
  }

  /** Bar width as a percentage of the busiest status. */
  protected barWidth(count: number): number {
    const max = this.maxStatusCount();
    return max === 0 ? 0 : Math.round((count / max) * 100);
  }
}
