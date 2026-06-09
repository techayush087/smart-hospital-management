import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'age', standalone: true })
export class AgePipe implements PipeTransform {
  transform(dob: string): string {
    if (!dob) return '';
    const years = Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
    return `${years} years old`;
  }
}
