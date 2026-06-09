export interface BookingRequest {
  doctorId: string;
  slotId: string;
  patientId: string;
  scheduledAt: string;
  duration: number;
  type: 'in-person' | 'virtual';
  reason: string;
  consultationType: 'in-person' | 'virtual';
  insuranceId?: string;
  urgency: 'routine' | 'urgent';
}
