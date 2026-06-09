import { AppointmentStatus } from './appointment.model';
export interface DashboardStats {
  todaysAppointments: number;
  totalPatients: number;
  pendingActions: number;
  doctorsAvailable: number;
  appointmentsTrend: { date: string; count: number }[];
  specialtyDistribution: { specialization: string; count: number }[];
}
