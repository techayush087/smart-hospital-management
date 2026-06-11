import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  loadDoctorSlots,
  selectAvailableSlots,
  selectSlotsLoading,
} from '../../../../store/appointment-catalog';
import { DoctorService } from '../../services/doctor.service';
import { Doctor, TimeSlot } from '../../../../core/models';
import { AppAvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { AppBadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { TimeSlotPipe } from '../../../../shared/pipes/time-slot.pipe';
import { toISODate } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [
    AppAvatarComponent,
    AppBadgeComponent,
    AppButtonComponent,
    TimeSlotPipe,
    DatePickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './doctor-detail.component.html',
  styleUrl: './doctor-detail.component.css',
})
export class DoctorDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly doctorService = inject(DoctorService);
  private readonly store = inject(Store);

  protected readonly doctorId = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly doctor = signal<Doctor | null>(null);
  protected readonly selectedDate = signal('');
  protected readonly today = toISODate(new Date());
  protected readonly selectedSlotId = signal<string | null>(null);

  protected readonly slots = toSignal(this.store.select(selectAvailableSlots), {
    initialValue: [] as TimeSlot[],
  });
  protected readonly slotsLoading = toSignal(
    this.store.select(selectSlotsLoading),
    { initialValue: false },
  );

  ngOnInit(): void {
    if (this.doctorId) {
      this.doctorService.getDoctorById(this.doctorId).subscribe((doctor) => {
        this.doctor.set(doctor);
      });
    }
  }

  onDateChange(date: string): void {
    this.selectedDate.set(date);
    this.selectedSlotId.set(null);
    if (date) {
      this.store.dispatch(loadDoctorSlots({ doctorId: this.doctorId, date }));
    }
  }

  onSelectSlot(slot: TimeSlot): void {
    if (!slot.isAvailable) return;
    this.selectedSlotId.set(slot.id);
  }

  onBook(): void {
    this.router.navigate(['/appointments', 'book', this.doctorId]);
  }
}
