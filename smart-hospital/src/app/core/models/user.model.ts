export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'admin';
  dateOfBirth: string;
  phone: string;
  bloodGroup?: string;
  allergies?: string[];
  existingConditions?: string[];
  avatar?: string;
  createdAt: string;
}
