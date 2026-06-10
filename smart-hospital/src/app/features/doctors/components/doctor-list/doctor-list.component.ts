import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';
import { filterDoctors } from '../../../../shared/helpers/doctor.helpers';
import { Doctor, DoctorFilter } from '../../../../core/models';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { DoctorCardComponent } from '../doctor-card/doctor-card.component';
import { DoctorFilterComponent } from '../doctor-filter/doctor-filter.component';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator.component';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [
    SearchBarComponent,
    EmptyStateComponent,
    DoctorCardComponent,
    DoctorFilterComponent,
    PaginatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.scss',
})
export class DoctorListComponent implements OnInit {
  private readonly doctorService = inject(DoctorService);
  private readonly router = inject(Router);

  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly loading = signal(true);
  protected readonly filters = signal<DoctorFilter>({});
  protected readonly searchTerm = signal('');

  /** Placeholder rows shown while doctors load. */
  protected readonly skeletons = [0, 1, 2, 3];

  protected readonly specializations = computed(() =>
    [...new Set(this.doctors().map((d) => d.specialization))].sort(),
  );

  protected readonly filtered = computed(() => {
    const byFilter = filterDoctors(this.doctors(), this.filters());
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return byFilter;
    return byFilter.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.specialization.toLowerCase().includes(term),
    );
  });

  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.doctorService.getDoctors().subscribe((doctors) => {
      this.doctors.set(doctors);
      this.loading.set(false);
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.page.set(1);
  }

  onFiltersChange(filters: DoctorFilter): void {
    this.filters.set(filters);
    this.page.set(1);
  }

  goToPage(p: number): void {
    this.page.set(p);
  }

  onBook(doctor: Doctor): void {
    this.router.navigate(['/appointments', 'book', doctor.id]);
  }
}
