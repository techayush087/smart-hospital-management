import { Pipe, PipeTransform } from '@angular/core';
import { truncate } from '../utils/string.utils';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, max = 50): string {
    return truncate(value ?? '', max);
  }
}
