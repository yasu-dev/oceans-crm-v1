export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  startTime: Date;
  endTime: Date;
  title: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export type CalendarView = 'month' | 'week' | 'day'; 