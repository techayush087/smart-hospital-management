import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorFilterComponent } from './doctor-filter.component';
import { DoctorFilter } from '../../../../core/models';

describe('DoctorFilterComponent', () => {
  let fixture: ComponentFixture<DoctorFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorFilterComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DoctorFilterComponent);
    fixture.componentRef.setInput('specializations', ['Cardiology', 'Dermatology']);
    fixture.detectChanges();
  });

  function byCy(cy: string): HTMLElement {
    return fixture.nativeElement.querySelector(`[data-cy="${cy}"]`);
  }

  it('emits filtersChange with the new specialization when changed', () => {
    let emitted: DoctorFilter | undefined;
    fixture.componentInstance.filtersChange.subscribe((f) => (emitted = f));

    const select = byCy('filter-specialization') as HTMLSelectElement;
    select.value = 'Cardiology';
    select.dispatchEvent(new Event('change'));

    expect(emitted).toEqual({ specialization: 'Cardiology' });
  });

  it('clears all filters and emits an empty filter', () => {
    const select = byCy('filter-specialization') as HTMLSelectElement;
    select.value = 'Cardiology';
    select.dispatchEvent(new Event('change'));

    let emitted: DoctorFilter | undefined;
    fixture.componentInstance.filtersChange.subscribe((f) => (emitted = f));

    (byCy('clear-filters') as HTMLButtonElement).click();

    expect(emitted).toEqual({});
  });
});
