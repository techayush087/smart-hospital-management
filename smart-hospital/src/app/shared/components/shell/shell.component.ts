import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationApiService } from '../../../features/notifications/services/notification-api.service';
import { initials } from '../../utils/string.utils';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

const PATIENT_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/patient/dashboard' },
  { label: 'Doctors', icon: 'medical_services', route: '/doctors' },
  { label: 'Appointments', icon: 'calendar_today', route: '/appointments' },
  { label: 'History', icon: 'history', route: '/patient/history' },
  { label: 'Prescriptions', icon: 'medication', route: '/patient/prescriptions' },
  { label: 'Timeline', icon: 'timeline', route: '/patient/timeline' },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
  { label: 'Schedules', icon: 'event_note', route: '/admin/schedules' },
  { label: 'Patient Records', icon: 'folder_shared', route: '/admin/records' },
  { label: 'Reports', icon: 'bar_chart', route: '/admin/reports' },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  private auth = inject(AuthService);
  private notifications = inject(NotificationService);
  private notificationApi = inject(NotificationApiService);
  private router = inject(Router);

  readonly user = this.auth.getCurrentUser();
  readonly unreadCount = this.notifications.unreadCount;

  ngOnInit(): void {
    // Load persisted notifications once so the bell badge matches what the
    // notifications page will show (a fresh user with none sees 0, consistently).
    const userId = this.user()?.id;
    if (userId) this.notificationApi.load(userId).subscribe();
  }

  readonly sidebarOpen = signal(false);
  readonly userMenuOpen = signal(false);

  readonly navItems = computed<NavItem[]>(() => {
    const role = this.user()?.role;
    if (role === 'admin') return ADMIN_NAV;
    if (role === 'customer') return PATIENT_NAV;
    return [];
  });

  readonly userInitials = computed(() => {
    const u = this.user();
    return u ? initials(`${u.firstName} ${u.lastName}`) : '';
  });

  readonly userName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  goToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  goToProfile(): void {
    this.closeUserMenu();
    this.router.navigate(['/auth/profile']);
  }

  logout(): void {
    this.closeUserMenu();
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
