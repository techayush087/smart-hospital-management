export interface DoctorFilter {
  specialization?: string;
  location?: string;
  availability?: string;
  consultationType?: 'in-person' | 'virtual' | 'both';
  minRating?: number;
}
