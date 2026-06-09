import { ChangeDetectionStrategy, Component } from '@angular/core';

// TODO(day-3 task-5): build full medical timeline
@Component({
  selector: 'app-medical-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './medical-timeline.component.html',
  styleUrl: './medical-timeline.component.scss',
})
export class MedicalTimelineComponent {}
