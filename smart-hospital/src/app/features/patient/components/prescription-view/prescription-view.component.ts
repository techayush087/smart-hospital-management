import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
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

  ngOnInit(): void {
    const patientId = this.auth.getCurrentUser()()?.id ?? '';
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

  print(): void {
    window.print();
  }
}
