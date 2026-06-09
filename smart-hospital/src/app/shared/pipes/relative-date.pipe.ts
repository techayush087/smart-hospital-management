import { Pipe, PipeTransform } from '@angular/core';
import { isToday, toISODate, addDays, formatDisplayDate } from '../utils/date.utils';

@Pipe({ name: 'relativeDate', standalone: true })
export class RelativeDatePipe implements PipeTransform {
  transform(dateStr: string): string {
    if (!dateStr) return '';
    if (isToday(dateStr)) return 'Today';
    if (toISODate(new Date(dateStr)) === toISODate(addDays(new Date(), -1))) return 'Yesterday';
    return formatDisplayDate(dateStr);
  }
}
