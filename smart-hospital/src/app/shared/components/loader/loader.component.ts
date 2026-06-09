import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [LottieComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class AppLoaderComponent {
  fullscreen = input(false);
  message = input('');

  readonly options: AnimationOptions = {
    path: '/animations/loading-pulse.json',
    loop: true,
    autoplay: true,
  };
}
