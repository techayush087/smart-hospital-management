import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface LinePoint {
  x: number;
  y: number;
  label: string;
}

/** Fixed SVG viewBox dimensions and inner padding. */
const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 120;
const PADDING_X = 8;
const PADDING_Y = 12;

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.css',
})
export class LineChartComponent {
  data = input<{ date: string; count: number }[]>([]);

  protected readonly viewWidth = VIEW_WIDTH;
  protected readonly viewHeight = VIEW_HEIGHT;

  /** True when there is nothing to plot. */
  protected readonly isEmpty = computed<boolean>(() => this.data().length === 0);

  /** Computed plotted points scaled to the data min/max across the fixed viewBox. */
  protected readonly points = computed<LinePoint[]>(() => {
    const series = this.data();
    if (series.length === 0) return [];

    const counts = series.map((d) => d.count);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const range = max - min || 1;

    const innerW = VIEW_WIDTH - PADDING_X * 2;
    const innerH = VIEW_HEIGHT - PADDING_Y * 2;
    const step = series.length > 1 ? innerW / (series.length - 1) : 0;

    return series.map((d, i) => {
      const x = PADDING_X + (series.length > 1 ? step * i : innerW / 2);
      const y = PADDING_Y + innerH - ((d.count - min) / range) * innerH;
      return { x, y, label: this.abbreviate(d.date) };
    });
  });

  /** Space-separated `x,y` pairs for the polyline `points` attribute. */
  protected readonly polylinePoints = computed<string>(() =>
    this.points()
      .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' '),
  );

  /** Returns the `MM-DD` portion of an ISO date for compact axis labels. */
  private abbreviate(date: string): string {
    return date.length >= 10 ? date.slice(5, 10) : date;
  }
}
