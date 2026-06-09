import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [AppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  title = input('');
  description = input('');
  icon = input('inbox');
  actionLabel = input('');
  action = output<void>();
}
