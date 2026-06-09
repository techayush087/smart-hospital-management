import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(day-4 task-4): replace placeholder with the real patient records admin.
@Component({
  selector: 'app-patient-records-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p>Patient records coming soon.</p>',
})
export class PatientRecordsAdminComponent {}
