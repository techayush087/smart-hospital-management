export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  consultationType: 'in-person' | 'virtual' | 'both';
  location: string;
  rating: number;
  reviewCount: number;
  avatar?: string;
  bio: string;
  languages: string[];
  consultationFee: number;
}
