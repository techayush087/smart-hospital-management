import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  let fixture: ComponentFixture<PaginatorComponent>;
  let component: PaginatorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginatorComponent] }).compileComponents();
    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
  });

  function setup(page: number, total: number, pageSize = 10): void {
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('total', total);
    fixture.componentRef.setInput('pageSize', pageSize);
    fixture.detectChanges();
  }

  it('hides itself when there is only one page', () => {
    setup(1, 5, 10);
    expect(fixture.nativeElement.querySelector('.paginator')).toBeNull();
  });

  it('computes total pages, range, and nav availability', () => {
    setup(2, 25, 10); // 3 pages, page 2 shows items 11–20
    expect(component.totalPages()).toBe(3);
    expect(component.from()).toBe(11);
    expect(component.to()).toBe(20);
    expect(component.canPrev()).toBe(true);
    expect(component.canNext()).toBe(true);
  });

  it('disables prev on the first page and next on the last', () => {
    setup(1, 25, 10);
    expect(component.canPrev()).toBe(false);
    setup(3, 25, 10);
    expect(component.canNext()).toBe(false);
  });

  it('emits pageChange with the next/previous page', () => {
    setup(2, 25, 10);
    const pages: number[] = [];
    component.pageChange.subscribe((p) => pages.push(p));
    component.next();
    component.prev();
    expect(pages).toEqual([3, 1]);
  });
});
