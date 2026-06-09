export interface AppointmentSlot {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  type: 'in-person' | 'virtual';
  createdBy?: string;
}
