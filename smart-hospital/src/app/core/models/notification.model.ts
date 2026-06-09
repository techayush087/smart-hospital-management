export interface Notification {
  id: string;
  userId: string;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule' | 'admin-alert';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedEntityId?: string;
}
