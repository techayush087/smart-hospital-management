import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AppButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [AppButtonComponent, LottieComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  title = input('');
  description = input('');
  icon = input('inbox');
  actionLabel = input('');
  /** Show the Lottie illustration. Falls back to the Material icon when false. */
  animated = input(true);
  action = output<void>();

  readonly options: AnimationOptions = {
    path: '/animations/empty-state.json',
    loop: true,
    autoplay: true,
  };
}
