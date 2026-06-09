export interface DoctorSchedule {
  id: string;
  doctorId: string;
  doctorName: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}
