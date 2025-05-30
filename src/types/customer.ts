export type CustomerStatus = 
  | 'last-month-visited'      // 先月来店(今月未来店)
  | 'two-months-no-visit'     // 先々月来店(2ヶ月未来店)
  | 'repeating-with-reservation'  // リピート中(予約あり)
  | 'repeating-no-reservation'    // リピート中(予約なし)
  | 'three-months-no-visit'   // 3ヶ月以上未来店
  | 'graduated';              // 卒業

export interface CustomerContract {
  course: string;
  amount: number;
  period: string;
  remainingVisits: number;
  startDate: string;
  endDate: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  firstNameKana: string;
  lastNameKana: string;
  primaryStaff: string;
  secondaryStaff?: string;
  contract: CustomerContract;
  lastVisitDate?: string;
  status?: CustomerStatus;
  notes?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWithAnalytics extends Customer {
  analytics: {
    averageInterval: number;
    frequencyChange: number;
    daysSinceLastVisit: number;
    visitPattern: string;
    riskScore: number;
    lossAmount: number;
  };
}