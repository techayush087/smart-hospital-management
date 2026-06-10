import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ShellComponent } from './shell.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationPollService } from '../../../core/services/notification-poll.service';
import { NotificationApiService } from '../../../features/notifications/services/notification-api.service';
import { User } from '../../../core/models';

function makeUser(role: 'customer' | 'admin'): User {
  return {
    id: 'u1', firstName: 'Sarah', lastName: 'Chen', email: 's@test.com', role,
    dateOfBirth: '1990-01-01', phone: '+1', createdAt: '',
  };
}

function configure(role: 'customer' | 'admin' | null) {
  const user = signal<User | null>(role ? makeUser(role) : null);
  const logout = vi.fn();
  TestBed.configureTestingModule({
    imports: [ShellComponent],
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { getCurrentUser: () => user, logout } },
      {
        provide: NotificationService,
        useValue: { unreadCount: signal(2), getNotifications: () => signal([]) },
      },
      { provide: NotificationApiService, useValue: { load: () => of([]) } },
      { provide: NotificationPollService, useValue: { start: vi.fn() } },
    ],
  });
  return { logout };
}

describe('ShellComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders patient nav for a customer', () => {
    configure('customer');
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('.shell__nav-link');
    const labels = Array.from(links).map((l: any) => l.textContent.trim());
    expect(labels.some((t: string) => t.includes('Doctors'))).toBe(true);
    expect(labels.some((t: string) => t.includes('Prescriptions'))).toBe(true);
    // patient must NOT see admin-only destinations
    expect(labels.some((t: string) => t.includes('Reports'))).toBe(false);
  });

  it('renders admin nav for an admin', () => {
    configure('admin');
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const labels = Array.from(fixture.nativeElement.querySelectorAll('.shell__nav-link')).map((l: any) => l.textContent.trim());
    expect(labels.some((t: string) => t.includes('Schedules'))).toBe(true);
    expect(labels.some((t: string) => t.includes('Reports'))).toBe(true);
  });

  it('shows the unread notification badge', () => {
    configure('customer');
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.shell__badge')?.textContent.trim()).toBe('2');
  });

  it('shows user initials in the user menu button', () => {
    configure('customer');
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.shell__avatar')?.textContent.trim()).toBe('SC');
  });

  it('logs out via the user menu', () => {
    const { logout } = configure('customer');
    const fixture = TestBed.createComponent(ShellComponent);
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    fixture.componentInstance.toggleUserMenu();
    fixture.detectChanges();
    const signOut = Array.from(fixture.nativeElement.querySelectorAll('.shell__menu-item'))
      .find((b: any) => b.textContent.includes('Sign out')) as HTMLButtonElement;
    signOut.click();
    expect(logout).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith(['/auth/login']);
  });
});
