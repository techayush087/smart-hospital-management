import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface DonutSlice {
  specialization: string;
  count: number;
  dashArray: string;
  dashOffset: number;
  colorIndex: number;
}

/** Fixed SVG geometry. The circumference drives the dash maths. */
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Number of token colour classes available in the SCSS palette. */
const PALETTE_SIZE = 5;

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './donut-chart.component.html',
  styleUrl: './donut-chart.component.css',
})
export class DonutChartComponent {
  data = input<{ specialization: string; count: number }[]>([]);

  protected readonly radius = RADIUS;
  protected readonly circumference = CIRCUMFERENCE;

  /** True when there is nothing to render. */
  protected readonly isEmpty = computed<boolean>(
    () => this.total() === 0,
  );

  /** Sum of all slice counts. */
  protected readonly total = computed<number>(() =>
    this.data().reduce((sum, d) => sum + d.count, 0),
  );

  /** Computed donut slices with stroke-dasharray/offset for each circle. */
  protected readonly slices = computed<DonutSlice[]>(() => {
    const total = this.total();
    if (total === 0) return [];

    let cumulative = 0;
    return this.data().map((d, i) => {
      const fraction = d.count / total;
      const length = fraction * CIRCUMFERENCE;
      const slice: DonutSlice = {
        specialization: d.specialization,
        count: d.count,
        dashArray: `${length.toFixed(3)} ${(CIRCUMFERENCE - length).toFixed(3)}`,
        // Negative offset rotates each slice to start where the previous ended.
        dashOffset: -cumulative,
        colorIndex: i % PALETTE_SIZE,
      };
      cumulative += length;
      return slice;
    });
  });
}
