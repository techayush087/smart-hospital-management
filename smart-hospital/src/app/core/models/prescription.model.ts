export interface Prescription {
  id: string;
  appointmentId: string;
  patientId?: string;
  /** The prescribing doctor (for the signature + header on the printed Rx). */
  doctorId?: string;
  doctorName?: string;
  specialization?: string;
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
