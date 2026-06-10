import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationToastComponent } from './notification-toast.component';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models';

function makeNotification(over: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    userId: 'u1',
    type: 'confirmation',
    title: 'Appointment confirmed',
    message: 'Your booking with Dr. Lee is set.',
    read: false,
    createdAt: new Date().toISOString(),
    ...over,
  };
}

describe('NotificationToastComponent', () => {
  let fixture: ComponentFixture<NotificationToastComponent>;
  let service: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationToastComponent],
      providers: [NotificationService],
    }).compileComponents();
    service = TestBed.inject(NotificationService);
    fixture = TestBed.createComponent(NotificationToastComponent);
  });

  it('renders a transient toast with title and message', () => {
    service.addTransient(makeNotification());
    fixture.detectChanges();

    const item = fixture.nativeElement.querySelector(
      '.app-notification-toast__item',
    );
    expect(item).not.toBeNull();
    expect(item.textContent).toContain('Appointment confirmed');
    expect(item.textContent).toContain('Your booking with Dr. Lee is set.');
  });

  it('does NOT render persisted inbox notifications (those belong to the bell)', () => {
    // The toast outlet shows transient toasts only — persisted notifications
    // rendering here too is exactly what caused duplicate toasts.
    service.addNotification(makeNotification());
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.app-notification-toast__item'),
    ).toBeNull();
  });

  it('removes the toast from the DOM when the close button is clicked', () => {
    service.addTransient(makeNotification());
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.app-notification-toast__item'),
    ).not.toBeNull();

    const closeBtn = fixture.nativeElement.querySelector(
      '.app-notification-toast__close',
    ) as HTMLButtonElement;
    closeBtn.click();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.app-notification-toast__item'),
    ).toBeNull();
  });

  it('shows at most three toasts', () => {
    // Distinct content so the dedupe guard doesn't drop them.
    for (let i = 0; i < 5; i++) {
      service.addTransient(
        makeNotification({ id: `n${i}`, title: `T${i}`, message: `M${i}` }),
      );
    }
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll(
      '.app-notification-toast__item',
    );
    expect(items.length).toBe(3);
  });

  it('auto-dismisses a toast after the duration elapses', () => {
    vi.useFakeTimers();
    try {
      service.addTransient(makeNotification());
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.app-notification-toast__item'),
      ).not.toBeNull();

      vi.advanceTimersByTime(4000);
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.app-notification-toast__item'),
      ).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
