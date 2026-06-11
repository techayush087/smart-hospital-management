import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AppCardComponent } from '../../../../shared/components/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { AppBadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { TimeSlotPipe } from '../../../../shared/pipes/time-slot.pipe';
import { AdminService } from '../../services/admin.service';
import { DoctorService } from '../../../doctors/services/doctor.service';
import { appointmentConflicts } from '../../../../shared/helpers/appointment.helpers';
import { Appointment, AppointmentSlot, Doctor, TimeSlot } from '../../../../core/models';

@Component({
  selector: 'app-schedule-manager',
  standalone: true,
  imports: [
    PageHeaderComponent,
    AppCardComponent,
    AppButtonComponent,
    AppBadgeComponent,
    ModalComponent,
    EmptyStateComponent,
    TimeSlotPipe,
    DatePickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-manager.component.html',
  styleUrl: './schedule-manager.component.css',
})
export class ScheduleManagerComponent implements OnInit {
  private adminService = inject(AdminService);
  private doctorService = inject(DoctorService);

  protected readonly doctors = signal<Doctor[]>([]);
  protected readonly slots = signal<TimeSlot[]>([]);

  protected readonly doctorId = signal('');
  protected readonly date = signal('');

  protected readonly loadingSlots = signal(false);
  protected readonly creating = signal(false);

  // Add-slot form state.
  protected readonly startTime = signal('');
  protected readonly endTime = signal('');
  protected readonly slotType = signal<'in-person' | 'virtual'>('in-person');
  protected readonly formError = signal('');

  // Delete confirmation modal state.
  protected readonly pendingDelete = signal<TimeSlot | null>(null);
  protected readonly deleting = signal(false);

  /** A doctor + date selection is required before slots are listed or added. */
  protected readonly canQuery = computed(
    () => this.doctorId().length > 0 && this.date().length > 0,
  );

  /** Add Slot is only actionable once the selection and both times are filled. */
  protected readonly canAdd = computed(
    () =>
      this.canQuery() && this.startTime().length > 0 && this.endTime().length > 0,
  );

  ngOnInit(): void {
    this.doctorService.getDoctors().subscribe((doctors) => this.doctors.set(doctors));
  }

  protected onDoctorChange(id: string): void {
    this.doctorId.set(id);
    this.formError.set('');
    this.loadSlots();
  }

  protected onDateChange(value: string): void {
    this.date.set(value);
    this.formError.set('');
    this.loadSlots();
  }

  protected onStartTimeChange(value: string): void {
    this.startTime.set(value);
  }

  protected onEndTimeChange(value: string): void {
    this.endTime.set(value);
  }

  protected onTypeChange(value: string): void {
    this.slotType.set(value === 'virtual' ? 'virtual' : 'in-person');
  }

  private loadSlots(): void {
    if (!this.canQuery()) {
      this.slots.set([]);
      return;
    }
    this.loadingSlots.set(true);
    this.doctorService.getAvailableSlots(this.doctorId(), this.date()).subscribe((slots) => {
      this.slots.set(slots);
      this.loadingSlots.set(false);
    });
  }

  protected addSlot(): void {
    if (!this.canAdd()) return;
    this.formError.set('');

    const startTime = `${this.date()}T${this.startTime()}:00`;
    const endTime = `${this.date()}T${this.endTime()}:00`;

    if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
      this.formError.set('End time must be after the start time.');
      return;
    }

    // Reuse appointmentConflicts: model the new slot as a TimeSlot and the
    // currently-listed slots as the "existing" appointments occupying a start time.
    const candidate: TimeSlot = {
      id: 'new',
      doctorId: this.doctorId(),
      startTime,
      endTime,
      isAvailable: true,
      type: this.slotType(),
    };
    const existing: Appointment[] = this.slots().map((s) => ({
      id: s.id,
      patientId: '',
      doctorId: s.doctorId,
      scheduledAt: s.startTime,
      duration: 0,
      type: s.type,
      status: 'confirmed',
      reason: '',
      createdAt: s.startTime,
      updatedAt: s.startTime,
    }));

    if (appointmentConflicts(candidate, existing)) {
      this.formError.set('A slot already exists at that start time.');
      return;
    }

    // json-server assigns the id; omit it from the create payload.
    const slot: AppointmentSlot = {
      id: '',
      doctorId: this.doctorId(),
      startTime,
      endTime,
      isAvailable: true,
      type: this.slotType(),
    };

    this.creating.set(true);
    this.adminService.createSlot(slot).subscribe(() => {
      this.creating.set(false);
      this.startTime.set('');
      this.endTime.set('');
      this.loadSlots();
    });
  }

  protected requestDelete(slot: TimeSlot): void {
    this.pendingDelete.set(slot);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  protected confirmDelete(): void {
    const slot = this.pendingDelete();
    if (!slot) return;
    this.deleting.set(true);
    this.adminService.deleteSlot(slot.id).subscribe(() => {
      this.deleting.set(false);
      this.pendingDelete.set(null);
      this.loadSlots();
    });
  }
}
