import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { initials } from '../../utils/string.utils';

@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AppAvatarComponent {
  src = input<string | undefined>(undefined);
  name = input('');
  size = input<'sm' | 'md' | 'lg'>('md');

  readonly initials = computed(() => initials(this.name()));
}
