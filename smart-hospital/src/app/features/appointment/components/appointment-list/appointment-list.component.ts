import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(day-2 task-9): full implementation
@Component({
  selector: 'app-appointment-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p class="appointment-list__placeholder">Appointments</p>',
  styles: [':host { display: block; }'],
})
export class AppointmentListComponent {}
