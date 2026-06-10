import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
  loadDoctorSlots,
  rescheduleAppointment,
  selectAvailableSlots,
  selectSelectedSlot,
  selectSlot,
  selectSlotsLoading,
} from '../../../../store/appointment-catalog';
import { Appointment, TimeSlot } from '../../../../core/models';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { TimeSlotPipe } from '../../../../shared/pipes/time-slot.pipe';
import { toISODate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-reschedule-modal',
  standalone: true,
  imports: [ModalComponent, AppButtonComponent, TimeSlotPipe, DatePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reschedule-modal.component.html',
  styleUrl: './reschedule-modal.component.scss',
})
export class RescheduleModalComponent {
  private readonly store = inject(Store);

  readonly appointment = input.required<Appointment>();
  readonly open = input(false);
  readonly closed = output<void>();

  protected readonly selectedDate = signal('');
  protected readonly today = toISODate(new Date());

  protected readonly slots = toSignal(this.store.select(selectAvailableSlots), {
    initialValue: [] as TimeSlot[],
  });
  protected readonly slotsLoading = toSignal(
    this.store.select(selectSlotsLoading),
    { initialValue: false },
  );
  protected readonly selectedSlot = toSignal(
    this.store.select(selectSelectedSlot),
    { initialValue: null as TimeSlot | null },
  );

  onDateChange(date: string): void {
    this.selectedDate.set(date);
    if (date) {
      this.store.dispatch(
        loadDoctorSlots({ doctorId: this.appointment().doctorId, date }),
      );
    }
  }

  onSelectSlot(slot: TimeSlot): void {
    if (!slot.isAvailable) return;
    this.store.dispatch(selectSlot({ slot }));
  }

  onConfirm(): void {
    const slot = this.selectedSlot();
    if (!slot) return;
    this.store.dispatch(
      rescheduleAppointment({
        appointmentId: this.appointment().id,
        newSlot: slot,
      }),
    );
    this.closed.emit();
  }

  onClose(): void {
    this.closed.emit();
  }
}
