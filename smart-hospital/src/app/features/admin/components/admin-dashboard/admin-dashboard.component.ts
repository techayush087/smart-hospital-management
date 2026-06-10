import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AppCardComponent } from '../../../../shared/components/card/card.component';
import { LineChartComponent } from '../charts/line-chart/line-chart.component';
import { DonutChartComponent } from '../charts/donut-chart/donut-chart.component';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminAppointment, DashboardStats } from '../../../../core/models';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';
import { AppointmentStatusPipe } from '../../../../shared/pipes/appointment-status.pipe';
import { AppBadgeComponent } from '../../../../shared/components/badge/badge.component';

interface KpiCard {
  key: string;
  label: string;
  value: number;
  icon: string;
  /** Visual weight per DESIGN.md §7 — the first card is the most prominent. */
  variant: 'feature' | 'standard' | 'alert' | 'success';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    AppCardComponent,
    LineChartComponent,
    DonutChartComponent,
    AppBadgeComponent,
    RelativeDatePipe,
    AppointmentStatusPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private auth = inject(AuthService);

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly loading = signal(true);
  protected readonly firstName = computed(
    () => this.auth.getCurrentUser()()?.firstName ?? 'Admin',
  );

  /** Loading skeleton placeholders, one per KPI card. */
  protected readonly skeletons = [0, 1, 2, 3];

  /** The five most recent bookings for the Recent Activity table. */
  protected readonly recent = signal<AdminAppointment[]>([]);

  ngOnInit(): void {
    this.adminService.getDashboardStats().subscribe((stats) => {
      this.stats.set(stats);
      this.loading.set(false);
    });
    this.adminService
      .getAllAppointments()
      .subscribe((list) => this.recent.set(list.slice(0, 5)));
  }

  /** Derives the four KPI cards from the loaded stats. */
  protected kpis(stats: DashboardStats): KpiCard[] {
    return [
      {
        key: 'today',
        label: "Today's Appointments",
        value: stats.todaysAppointments,
        icon: 'event_available',
        variant: 'feature',
      },
      {
        key: 'patients',
        label: 'Total Patients',
        value: stats.totalPatients,
        icon: 'groups',
        variant: 'standard',
      },
      {
        key: 'pending',
        label: 'Pending Actions',
        value: stats.pendingActions,
        icon: 'pending_actions',
        variant: 'alert',
      },
      {
        key: 'doctors',
        label: 'Doctors Available',
        value: stats.doctorsAvailable,
        icon: 'stethoscope',
        variant: 'success',
      },
    ];
  }
}
