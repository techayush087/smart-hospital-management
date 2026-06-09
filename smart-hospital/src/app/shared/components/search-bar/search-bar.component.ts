import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  placeholder = input('Search...');
  value = input('');
  search = output<string>();
  clear = output<void>();

  protected readonly currentValue = signal('');
  private readonly query$ = new Subject<string>();

  constructor() {
    // Keep the local value in sync when the bound input changes.
    effect(() => this.currentValue.set(this.value()));
  }

  ngOnInit(): void {
    this.query$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => this.search.emit(term));
  }

  // Exposed for templates and tests to push a new term into the debounce stream.
  onInput(term: string): void {
    this.currentValue.set(term);
    this.query$.next(term);
  }

  onClear(): void {
    this.currentValue.set('');
    this.query$.next('');
    this.clear.emit();
  }
}
