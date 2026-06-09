import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppButtonComponent } from './button.component';

describe('AppButtonComponent', () => {
  let fixture: ComponentFixture<AppButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppButtonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AppButtonComponent);
  });

  it('renders the label text', () => {
    fixture.componentRef.setInput('label', 'Save');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.textContent).toContain('Save');
  });

  it('emits clicked once on a normal click', () => {
    const spy = vi.fn();
    fixture.componentInstance.clicked.subscribe(spy);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('shows a spinner and does not emit clicked while loading', () => {
    const spy = vi.fn();
    fixture.componentInstance.clicked.subscribe(spy);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-progress-spinner');
    expect(spinner).not.toBeNull();

    // onClick guards against loading; the DOM button is also disabled.
    fixture.componentInstance.onClick();
    expect(spy).not.toHaveBeenCalled();
  });
});
