import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
  loadDoctorSlots,
  selectAvailableSlots,
  selectSelectedSlot,
  selectSlot,
  selectSlotsLoading,
} from '../../../../../../store/appointment-catalog';
import { TimeSlot } from '../../../../../../core/models';
import { TimeSlotPipe } from '../../../../../../shared/pipes/time-slot.pipe';

@Component({
  selector: 'app-step-select-slot',
  standalone: true,
  imports: [TimeSlotPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-select-slot.component.html',
  styleUrl: './step-select-slot.component.scss',
})
export class StepSelectSlotComponent {
  private readonly store = inject(Store);

  readonly doctorId = input.required<string>();

  protected readonly selectedDate = signal('');

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
        loadDoctorSlots({ doctorId: this.doctorId(), date }),
      );
    }
  }

  onSelectSlot(slot: TimeSlot): void {
    if (!slot.isAvailable) return;
    this.store.dispatch(selectSlot({ slot }));
  }
}
