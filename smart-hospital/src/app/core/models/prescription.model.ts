export interface Prescription {
  id: string;
  appointmentId: string;
  patientId?: string;
  medications: Medication[];
  instructions: string;
  issuedAt: string;
  validUntil?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}
