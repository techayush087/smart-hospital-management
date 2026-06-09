import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PageHeaderComponent);
  });

  it('renders the title', () => {
    fixture.componentRef.setInput('title', 'My Appointments');
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.app-page-header__title');
    expect(title.textContent).toContain('My Appointments');
  });

  it('hides the back button unless showBack is true', () => {
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.app-page-header__back'),
    ).toBeNull();
  });

  it('emits back when the back button is clicked', () => {
    const spy = vi.fn();
    fixture.componentInstance.back.subscribe(spy);
    fixture.componentRef.setInput('showBack', true);
    fixture.detectChanges();

    const backBtn = fixture.nativeElement.querySelector(
      '.app-page-header__back',
    ) as HTMLButtonElement;
    expect(backBtn).not.toBeNull();
    backBtn.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('renders breadcrumbs when provided', () => {
    fixture.componentRef.setInput('breadcrumbs', ['Home', 'Appointments']);
    fixture.detectChanges();
    const crumbs = fixture.nativeElement.querySelectorAll(
      '.app-page-header__crumb',
    );
    expect(crumbs.length).toBe(2);
  });
});
