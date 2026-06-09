import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationItemComponent } from './notification-item.component';
import { Notification } from '../../../../core/models';

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    userId: 'u1',
    type: 'confirmation',
    title: 'Appointment confirmed',
    message: 'Your appointment with Dr. Roy is confirmed.',
    read: false,
    createdAt: '2026-05-20T09:00:00.000Z',
    ...overrides,
  };
}

describe('NotificationItemComponent', () => {
  let fixture: ComponentFixture<NotificationItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationItemComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(NotificationItemComponent);
  });

  it('renders the title and message', () => {
    fixture.componentRef.setInput('notification', makeNotification());
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Appointment confirmed');
    expect(text).toContain('Your appointment with Dr. Roy is confirmed.');
  });

  it('shows the correct icon for the notification type', () => {
    fixture.componentRef.setInput(
      'notification',
      makeNotification({ type: 'reschedule' }),
    );
    fixture.detectChanges();

    const icon: HTMLElement = fixture.nativeElement.querySelector(
      '.notification-item__icon',
    );
    expect(icon.textContent?.trim()).toBe('event_repeat');
  });

  it('adds the --unread modifier when unread', () => {
    fixture.componentRef.setInput(
      'notification',
      makeNotification({ read: false }),
    );
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="notification-item"]',
    );
    expect(root.classList).toContain('notification-item--unread');
  });

  it('emits read with the notification id when clicked', () => {
    const notification = makeNotification({ id: 'n42' });
    fixture.componentRef.setInput('notification', notification);
    fixture.detectChanges();

    let emitted: string | undefined;
    fixture.componentInstance.read.subscribe((id) => (emitted = id));

    const root: HTMLElement = fixture.nativeElement.querySelector(
      '[data-cy="notification-item"]',
    );
    root.click();

    expect(emitted).toBe('n42');
  });
});
