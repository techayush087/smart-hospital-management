import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SearchBarComponent);
    fixture.detectChanges();
  });

  it('renders the search input and leading icon', () => {
    const input = fixture.nativeElement.querySelector(
      '[data-cy="search-input"]',
    );
    expect(input).not.toBeNull();
    const icon = fixture.nativeElement.querySelector('.app-search-bar__icon');
    expect(icon.textContent).toContain('search');
  });

  it('emits search after the debounce window', () => {
    vi.useFakeTimers();
    try {
      const spy = vi.fn();
      fixture.componentInstance.search.subscribe(spy);

      fixture.componentInstance.onInput('cardio');
      // Not emitted before the debounce window elapses.
      expect(spy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('cardio');
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows the clear button only when text is present', () => {
    expect(
      fixture.nativeElement.querySelector('.app-search-bar__clear'),
    ).toBeNull();

    fixture.componentInstance.onInput('x');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.app-search-bar__clear'),
    ).not.toBeNull();
  });

  it('resets the value and emits clear on clear', () => {
    const clearSpy = vi.fn();
    fixture.componentInstance.clear.subscribe(clearSpy);

    fixture.componentInstance.onInput('abc');
    fixture.detectChanges();

    const clearBtn = fixture.nativeElement.querySelector(
      '.app-search-bar__clear',
    ) as HTMLButtonElement;
    clearBtn.click();
    fixture.detectChanges();

    expect(clearSpy).toHaveBeenCalledTimes(1);
    const input = fixture.nativeElement.querySelector(
      '[data-cy="search-input"]',
    ) as HTMLInputElement;
    expect(input.value).toBe('');
  });
});
