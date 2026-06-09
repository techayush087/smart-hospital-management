export interface PatientRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup?: string;
  totalVisits: number;
  lastVisit?: string;
  activeConditions: string[];
}
