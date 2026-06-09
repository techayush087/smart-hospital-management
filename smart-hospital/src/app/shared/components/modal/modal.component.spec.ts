import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ModalComponent);
  });

  it('does not render the panel when open is false', () => {
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('.app-modal__panel');
    expect(panel).toBeNull();
  });

  it('renders the panel and title when open is true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Confirm booking');
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.app-modal__panel');
    expect(panel).not.toBeNull();

    const title = fixture.nativeElement.querySelector('.app-modal__title');
    expect(title.textContent).toContain('Confirm booking');
  });

  it('emits closed when the close button is clicked', () => {
    const spy = vi.fn();
    fixture.componentInstance.closed.subscribe(spy);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector(
      '.app-modal__close',
    ) as HTMLButtonElement;
    closeBtn.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('emits closed when the backdrop is clicked', () => {
    const spy = vi.fn();
    fixture.componentInstance.closed.subscribe(spy);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector(
      '.app-modal__backdrop',
    ) as HTMLElement;
    backdrop.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('emits closed on Escape keydown while open', () => {
    const spy = vi.fn();
    fixture.componentInstance.closed.subscribe(spy);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape' }),
    );
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
