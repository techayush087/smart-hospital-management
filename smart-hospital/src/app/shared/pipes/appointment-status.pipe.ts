import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '../../core/models';
import { capitalize } from '../utils/string.utils';

@Pipe({ name: 'appointmentStatus', standalone: true })
export class AppointmentStatusPipe implements PipeTransform {
  transform(status: AppointmentStatus): string {
    return status === 'no-show' ? 'No-show' : capitalize(status);
  }
}
