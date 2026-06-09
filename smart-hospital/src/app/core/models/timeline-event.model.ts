import { AppointmentStatus } from './appointment.model';
export interface TimelineEvent {
  id: string;
  date: string;
  doctorName: string;
  specialization: string;
  title: string;
  status: AppointmentStatus;
  prescriptionSummary?: string;
}
