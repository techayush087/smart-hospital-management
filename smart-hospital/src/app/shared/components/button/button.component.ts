import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  host: {
    '[class.app-button-host--block]': 'fullWidth()',
  },
})
export class AppButtonComponent {
  label = input('');
  variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  /** Native button type. Defaults to 'button' so a button inside a form never
   *  submits it accidentally; set 'submit' explicitly on form CTAs. */
  type = input<'button' | 'submit'>('button');
  loading = input(false);
  disabled = input(false);
  /** Stretch the button to the full width of its container (e.g. form submit CTAs). */
  fullWidth = input(false);
  clicked = output<void>();

  onClick(): void {
    if (!this.loading() && !this.disabled()) this.clicked.emit();
  }
}
