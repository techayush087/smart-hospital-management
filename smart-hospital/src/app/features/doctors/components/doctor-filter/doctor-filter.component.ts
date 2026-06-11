import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DoctorFilter } from '../../../../core/models';

type ConsultationToggle = 'all' | 'in-person' | 'virtual';

@Component({
  selector: 'app-doctor-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './doctor-filter.component.html',
  styleUrl: './doctor-filter.component.css',
})
export class DoctorFilterComponent {
  specializations = input<string[]>([]);
  filtersChange = output<DoctorFilter>();

  protected readonly activeFilters = signal<DoctorFilter>({});
  protected readonly consultationToggle = signal<ConsultationToggle>('all');

  protected readonly ratingOptions = [
    { label: 'Any', value: 0 },
    { label: '3+', value: 3 },
    { label: '4+', value: 4 },
    { label: '4.5+', value: 4.5 },
  ];

  protected readonly consultationOptions: { label: string; value: ConsultationToggle }[] = [
    { label: 'All', value: 'all' },
    { label: 'In-Person', value: 'in-person' },
    { label: 'Virtual', value: 'virtual' },
  ];

  onSpecializationChange(value: string): void {
    this.update({ specialization: value || undefined });
  }

  onLocationChange(value: string): void {
    this.update({ location: value || undefined });
  }

  onConsultationChange(value: ConsultationToggle): void {
    this.consultationToggle.set(value);
    this.update({
      consultationType: value === 'all' ? undefined : value,
    });
  }

  onMinRatingChange(value: string): void {
    const rating = Number(value);
    this.update({ minRating: rating > 0 ? rating : undefined });
  }

  clearAll(): void {
    this.activeFilters.set({});
    this.consultationToggle.set('all');
    this.filtersChange.emit(this.activeFilters());
  }

  private update(patch: Partial<DoctorFilter>): void {
    this.activeFilters.update((f) => ({ ...f, ...patch }));
    this.filtersChange.emit(this.activeFilters());
  }
}
