import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(day-3 task-5): build full prescription view
@Component({
  selector: 'app-prescription-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './prescription-view.component.html',
  styleUrl: './prescription-view.component.scss',
})
export class PrescriptionViewComponent {}
