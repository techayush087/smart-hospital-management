import { User } from './user.model';
export interface LoginDto { email: string; password: string; }
export interface RegisterDto {
  firstName: string; lastName: string; email: string; password: string;
  dateOfBirth: string; phone: string; role: 'customer' | 'admin';
  bloodGroup?: string; allergies?: string[]; existingConditions?: string[];
}
export interface AuthResponse {
  accessToken: string;
  user: User;
}
