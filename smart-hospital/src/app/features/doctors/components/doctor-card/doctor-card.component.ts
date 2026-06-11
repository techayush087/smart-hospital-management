import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AppAvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { AppBadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { Doctor } from '../../../../core/models';

@Component({
  selector: 'app-doctor-card',
  standalone: true,
  imports: [AppAvatarComponent, AppBadgeComponent, AppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './doctor-card.component.html',
  styleUrl: './doctor-card.component.css',
})
export class DoctorCardComponent {
  doctor = input.required<Doctor>();
  book = output<Doctor>();

  /** Consultation types rendered as badges. */
  protected readonly consultationLabels = computed<string[]>(() => {
    const type = this.doctor().consultationType;
    if (type === 'both') return ['In-Person', 'Virtual'];
    return [type === 'in-person' ? 'In-Person' : 'Virtual'];
  });

  onBook(): void {
    this.book.emit(this.doctor());
  }
}
