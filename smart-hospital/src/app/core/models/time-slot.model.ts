export interface TimeSlot {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  type: 'in-person' | 'virtual';
}
