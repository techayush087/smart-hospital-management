import { AppointmentStatus } from './appointment.model';
export interface VisitRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  visitDate: string;
  type: 'in-person' | 'virtual';
  status: AppointmentStatus;
  summary: string;
  prescriptionId?: string;
}
