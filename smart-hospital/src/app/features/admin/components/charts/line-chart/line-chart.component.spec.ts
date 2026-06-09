import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LineChartComponent } from './line-chart.component';

describe('LineChartComponent', () => {
  let fixture: ComponentFixture<LineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineChartComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(LineChartComponent);
  });

  it('renders a polyline scaled to the data with the correct number of points', () => {
    fixture.componentRef.setInput('data', [
      { date: '2026-06-01', count: 4 },
      { date: '2026-06-02', count: 9 },
      { date: '2026-06-03', count: 6 },
    ]);
    fixture.detectChanges();

    const polyline: SVGPolylineElement | null =
      fixture.nativeElement.querySelector('polyline');
    expect(polyline).not.toBeNull();

    const pointsAttr = polyline!.getAttribute('points') ?? '';
    const pairs = pointsAttr.trim().split(/\s+/);
    expect(pairs.length).toBe(3);

    const dots = fixture.nativeElement.querySelectorAll('circle');
    expect(dots.length).toBe(3);
  });

  it('shows an empty state and no svg when data is empty', () => {
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
    expect(fixture.nativeElement.querySelector('.line-chart__empty')).not.toBeNull();
  });
});
