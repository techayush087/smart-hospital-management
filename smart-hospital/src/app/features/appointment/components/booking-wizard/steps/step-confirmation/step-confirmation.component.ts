import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
  bookSlot,
  selectBookingInProgress,
  selectSelectedSlot,
} from '../../../../../../store/appointment-catalog';
import {
  BookingRequest,
  Doctor,
  TimeSlot,
} from '../../../../../../core/models';
import { AuthService } from '../../../../../../core/services/auth.service';
import { AppButtonComponent } from '../../../../../../shared/components/button/button.component';
import { TimeSlotPipe } from '../../../../../../shared/pipes/time-slot.pipe';

@Component({
  selector: 'app-step-confirmation',
  standalone: true,
  imports: [AppButtonComponent, TimeSlotPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-confirmation.component.html',
  styleUrl: './step-confirmation.component.scss',
})
export class StepConfirmationComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly doctor = input<Doctor | null>(null);
  readonly form = input.required<FormGroup>();

  protected readonly selectedSlot = toSignal(
    this.store.select(selectSelectedSlot),
    { initialValue: null as TimeSlot | null },
  );
  protected readonly bookingInProgress = toSignal(
    this.store.select(selectBookingInProgress),
    { initialValue: false },
  );

  protected readonly entries = (): { label: string; value: string }[] => {
    const v = this.form().value as Record<string, string>;
    return [
      { label: 'Reason for Visit', value: v['reason'] },
      { label: 'Consultation Type', value: v['consultationType'] },
      { label: 'Insurance ID', value: v['insuranceId'] || '—' },
      { label: 'Urgency Level', value: v['urgency'] },
    ];
  };

  onConfirm(): void {
    const slot = this.selectedSlot();
    if (!slot) return;

    const user = this.auth.getCurrentUser()();
    const v = this.form().value as {
      reason: string;
      consultationType: 'in-person' | 'virtual';
      insuranceId?: string;
      urgency: 'routine' | 'urgent';
    };

    const durationMs =
      new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime();
    const duration = Math.max(0, Math.round(durationMs / 60000)) || 30;

    const booking: BookingRequest = {
      doctorId: slot.doctorId,
      slotId: slot.id,
      patientId: user?.id ?? '',
      scheduledAt: slot.startTime,
      duration,
      type: v.consultationType,
      reason: v.reason,
      consultationType: v.consultationType,
      insuranceId: v.insuranceId || undefined,
      urgency: v.urgency,
    };

    this.store.dispatch(bookSlot({ booking }));
    this.router.navigate(['/appointments']);
  }
}
