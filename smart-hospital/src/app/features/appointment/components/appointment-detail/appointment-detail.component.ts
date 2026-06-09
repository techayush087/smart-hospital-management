import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(day-2 task-9): full implementation
@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p class="appointment-detail__placeholder">Appointment detail</p>',
  styles: [':host { display: block; }'],
})
export class AppointmentDetailComponent {}
