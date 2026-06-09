import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeSlot', standalone: true })
export class TimeSlotPipe implements PipeTransform {
  transform(start: string, end?: string): string {
    const fmt = (d: string) =>
      new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
  }
}
