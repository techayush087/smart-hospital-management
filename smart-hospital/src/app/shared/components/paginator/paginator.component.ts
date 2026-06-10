import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * Reusable pagination control. Pure UI — the parent owns the page signal and slices
 * its own data. Emits `pageChange` with the new 1-based page number.
 */
@Component({
  selector: 'app-paginator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
})
export class PaginatorComponent {
  /** Current 1-based page. */
  page = input.required<number>();
  /** Total number of items across all pages. */
  total = input.required<number>();
  /** Items per page. */
  pageSize = input(10);

  pageChange = output<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );
  readonly from = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );
  readonly to = computed(() =>
    Math.min(this.page() * this.pageSize(), this.total()),
  );
  readonly canPrev = computed(() => this.page() > 1);
  readonly canNext = computed(() => this.page() < this.totalPages());

  prev(): void {
    if (this.canPrev()) this.pageChange.emit(this.page() - 1);
  }
  next(): void {
    if (this.canNext()) this.pageChange.emit(this.page() + 1);
  }
}
