import { AppointmentStatus } from './appointment.model';
import { DateRange } from './date-range.model';
export interface ReportData {
  range: DateRange;
  byStatus: { status: AppointmentStatus; count: number }[];
  total: number;
}
