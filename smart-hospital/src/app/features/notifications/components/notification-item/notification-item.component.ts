import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { Notification } from '../../../../core/models';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';

const ICON_BY_TYPE: Record<Notification['type'], string> = {
  confirmation: 'check_circle',
  reminder: 'access_time',
  cancellation: 'event_busy',
  reschedule: 'event_repeat',
  'admin-alert': 'warning',
};

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [RelativeDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-item.component.html',
  styleUrl: './notification-item.component.css',
})
export class NotificationItemComponent {
  notification = input.required<Notification>();
  read = output<string>();

  protected readonly icon = computed(
    () => ICON_BY_TYPE[this.notification().type],
  );

  onClick(): void {
    this.read.emit(this.notification().id);
  }
}
