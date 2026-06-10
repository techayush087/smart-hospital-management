import { Appointment } from './appointment.model';

/** An appointment enriched with the patient + doctor display names, for admin views. */
export interface AdminAppointment extends Appointment {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  specialization: string;
}
