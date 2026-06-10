import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { PatientRecordsService } from '../../services/patient-records.service';
import { Prescription } from '../../../../core/models';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AppCardComponent } from '../../../../shared/components/card/card.component';
import { AppButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';

@Component({
  selector: 'app-prescription-view',
  standalone: true,
  imports: [
    PageHeaderComponent,
    AppCardComponent,
    AppButtonComponent,
    EmptyStateComponent,
    RelativeDatePipe,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './prescription-view.component.html',
  styleUrl: './prescription-view.component.scss',
})
export class PrescriptionViewComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly records = inject(PatientRecordsService);

  protected readonly prescriptions = signal<Prescription[]>([]);
  protected readonly loading = signal(true);

  private readonly user = this.auth.getCurrentUser();
  protected readonly patientName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });
  protected readonly patientDob = computed(() => this.user()?.dateOfBirth ?? '');

  /** The prescription being printed (null = print all / none). When set, only that
   *  formal Rx sheet is sent to the printer via the print stylesheet. */
  protected readonly printingId = signal<string | null>(null);

  ngOnInit(): void {
    const patientId = this.user()?.id ?? '';
    if (!patientId) {
      this.loading.set(false);
      return;
    }
    this.records.getPrescriptions(patientId).subscribe({
      next: (list) => {
        this.prescriptions.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Print a single prescription as a formal Rx sheet. */
  printOne(id: string): void {
    this.printingId.set(id);
    // Let the DOM update so only the chosen Rx sheet is visible to the printer.
    setTimeout(() => {
      window.print();
      this.printingId.set(null);
    });
  }
}
