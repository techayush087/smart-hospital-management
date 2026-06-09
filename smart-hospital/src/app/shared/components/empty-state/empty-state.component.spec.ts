import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(EmptyStateComponent);
  });

  it('renders the title and description', () => {
    fixture.componentRef.setInput('title', 'No appointments');
    fixture.componentRef.setInput('description', 'Book one to get started.');
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.app-empty-state__title');
    expect(title.textContent).toContain('No appointments');
    const desc = fixture.nativeElement.querySelector(
      '.app-empty-state__description',
    );
    expect(desc.textContent).toContain('Book one to get started.');
  });

  it('does not render an action button without an actionLabel', () => {
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('app-button'),
    ).toBeNull();
  });

  it('emits action when the action button is clicked', () => {
    const spy = vi.fn();
    fixture.componentInstance.action.subscribe(spy);
    fixture.componentRef.setInput('actionLabel', 'Book now');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'app-button button',
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    button.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
