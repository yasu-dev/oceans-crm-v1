export interface Visit {
  id: string;
  customerId: string;
  date: string;
  notes?: string;
  createdAt: string;
  staffName?: string;
  treatmentContent?: string;
  visitTime?: string;
  leaveTime?: string;
  amount?: number;
  paymentMethod?: string;
}

export interface FollowUp {
  id: string;
  customerId: string;
  date: string;
  method: 'line' | 'phone' | 'email' | 'other';
  response: 'good' | 'neutral' | 'none' | 'negative';
  nextAction?: string;
  notes?: string;
  staffId: string;
  createdAt: string;
}