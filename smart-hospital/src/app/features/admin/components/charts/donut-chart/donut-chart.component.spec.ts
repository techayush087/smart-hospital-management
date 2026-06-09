import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonutChartComponent } from './donut-chart.component';

describe('DonutChartComponent', () => {
  let fixture: ComponentFixture<DonutChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonutChartComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DonutChartComponent);
  });

  it('renders one circle slice and one legend item per data point', () => {
    fixture.componentRef.setInput('data', [
      { specialization: 'Cardiology', count: 7 },
      { specialization: 'Dermatology', count: 3 },
    ]);
    fixture.detectChanges();

    const slices = fixture.nativeElement.querySelectorAll('circle.donut__slice');
    expect(slices.length).toBe(2);

    const legendItems = fixture.nativeElement.querySelectorAll('.donut__legend-item');
    expect(legendItems.length).toBe(2);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Cardiology');
    expect(text).toContain('Dermatology');
  });

  it('shows an empty state and no svg when data is empty', () => {
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
    expect(fixture.nativeElement.querySelector('.donut__empty')).not.toBeNull();
  });
});
