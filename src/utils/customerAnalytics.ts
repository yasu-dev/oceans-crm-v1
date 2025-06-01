import { Customer, CustomerStatus } from '../types/customer';
import { Visit } from '../types/visit';
import { differenceInDays, differenceInMonths, parseISO, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';

/**
 * Calculate the customer's current status based on visit history
 */
export function calculateCustomerStatus(customer: Customer, visits: Visit[]): CustomerStatus {
  // モックデータにstatusフィールドが指定されている場合はそれを優先
  if (typeof customer.status !== 'undefined') {
    return customer.status;
  }
  const customerVisits = visits.filter(visit => visit.customerId === customer.id);
  
  // 契約終了（残回数0）の場合は卒業
  if (customer.contract.remainingVisits === 0) {
    return 'graduated';
  }
  
  if (customerVisits.length === 0) {
    return 'three-months-no-visit';
  }
  
  const today = new Date();
  const thisMonth = today;
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  
  // Sort visits by date, newest first
  const sortedVisits = [...customerVisits].sort((a, b) => 
    parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );
  
  const lastVisitDate = parseISO(sortedVisits[0].date);
  const monthsSinceLastVisit = differenceInMonths(today, lastVisitDate);
  
  // 今月来店があるかチェック
  const visitedThisMonth = hasVisitedInMonth(customer, visits, thisMonth);
  const visitedLastMonth = hasVisitedInMonth(customer, visits, lastMonth);
  const visitedTwoMonthsAgo = hasVisitedInMonth(customer, visits, twoMonthsAgo);
  const hasFutureRes = hasFutureReservation(customer, visits);
  
  // 3ヶ月以上未来店
  if (monthsSinceLastVisit >= 3) {
    return 'three-months-no-visit';
  }
  
  // 先々月来店(2ヶ月未来店)
  if (visitedTwoMonthsAgo && !visitedLastMonth && !visitedThisMonth) {
    return 'two-months-no-visit';
  }
  
  // 先月来店(今月未来店)
  if (visitedLastMonth && !visitedThisMonth && !hasFutureRes) {
    return 'last-month-visited';
  }
  
  // リピート中
  if (monthsSinceLastVisit < 3) {
    if (hasFutureRes) {
      return 'repeating-with-reservation';
    } else {
      return 'repeating-no-reservation';
    }
  }
  
  return 'three-months-no-visit';
}

/**
 * Calculate average interval between visits
 */
export function calculateAverageInterval(customer: Customer, visits: Visit[]): number {
  const customerVisits = visits.filter(visit => visit.customerId === customer.id);
  
  if (customerVisits.length <= 1) {
    return 30; // Default to 30 days if insufficient data
  }
  
  // Sort visits by date, oldest first
  const sortedVisits = [...customerVisits].sort((a, b) => 
    parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
  
  let totalDays = 0;
  for (let i = 1; i < sortedVisits.length; i++) {
    const current = parseISO(sortedVisits[i].date);
    const previous = parseISO(sortedVisits[i-1].date);
    totalDays += differenceInDays(current, previous);
  }
  
  return Math.round(totalDays / (sortedVisits.length - 1));
}

/**
 * Calculate frequency change in visit pattern
 */
export function calculateFrequencyChange(customer: Customer, visits: Visit[]): number {
  const customerVisits = visits.filter(visit => visit.customerId === customer.id);
  
  if (customerVisits.length < 4) {
    return 0; // Not enough data
  }
  
  // Sort visits by date, oldest first
  const sortedVisits = [...customerVisits].sort((a, b) => 
    parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
  
  const halfLength = Math.floor(sortedVisits.length / 2);
  
  // Calculate average interval for first half
  let firstHalfDays = 0;
  for (let i = 1; i < halfLength; i++) {
    const current = parseISO(sortedVisits[i].date);
    const previous = parseISO(sortedVisits[i-1].date);
    firstHalfDays += differenceInDays(current, previous);
  }
  const firstHalfAvg = firstHalfDays / (halfLength - 1);
  
  // Calculate average interval for second half
  let secondHalfDays = 0;
  for (let i = halfLength + 1; i < sortedVisits.length; i++) {
    const current = parseISO(sortedVisits[i].date);
    const previous = parseISO(sortedVisits[i-1].date);
    secondHalfDays += differenceInDays(current, previous);
  }
  const secondHalfAvg = secondHalfDays / (sortedVisits.length - halfLength - 1);
  
  // Calculate percentage change
  if (firstHalfAvg === 0) return 0;
  return Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
}

/**
 * Calculate estimated loss amount for a customer
 * 都度払いを考慮した算出方法：
 * 1. 過去の来店履歴から平均施術金額を算出
 * 2. 平均来店間隔から月平均来店回数を計算
 * 3. ステータスに応じた損失確率を適用
 * 4. 月間想定損失額 = 平均施術金額 × 月平均来店回数 × 損失確率
 */
export function calculateLossAmount(customer: Customer, visits: Visit[]): number {
  const status = calculateCustomerStatus(customer, visits);
  
  if (status === 'repeating-with-reservation' || status === 'repeating-no-reservation' || status === 'graduated') {
    return 0;
  }
  
  // 顧客の来店履歴を取得
  const customerVisits = visits.filter(visit => visit.customerId === customer.id);
  
  // 平均施術金額を計算
  let avgAmount = 0;
  const visitsWithAmount = customerVisits.filter(v => v.amount && v.amount > 0);
  if (visitsWithAmount.length > 0) {
    const totalAmount = visitsWithAmount.reduce((sum, v) => sum + (v.amount || 0), 0);
    avgAmount = totalAmount / visitsWithAmount.length;
  } else {
    // 施術金額データがない場合は契約金額から推定
    avgAmount = customer.contract.amount / 12; // 年間契約と仮定して月額換算
  }
  
  // 平均来店間隔から月平均来店回数を計算
  const avgInterval = calculateAverageInterval(customer, visits);
  const monthlyVisits = avgInterval > 0 ? 30 / avgInterval : 1; // 月30日として計算
  
  // ステータスに応じた損失確率
  let lossProbability = 0;
  switch (status) {
    case 'last-month-visited':
      lossProbability = 0.3; // 30%の確率で失客
      break;
    case 'two-months-no-visit':
      lossProbability = 0.6; // 60%の確率で失客
      break;
    case 'three-months-no-visit':
      lossProbability = 0.9; // 90%の確率で失客
      break;
  }
  
  // 月間想定損失額を計算
  const monthlyLoss = avgAmount * monthlyVisits * lossProbability;
  
  return Math.round(monthlyLoss);
}

/**
 * Calculate customer risk score (0-100)
 */
export function calculateRiskScore(customer: Customer, visits: Visit[]): number {
  const status = calculateCustomerStatus(customer, visits);
  const avgInterval = calculateAverageInterval(customer, visits);
  const freqChange = calculateFrequencyChange(customer, visits);
  
  // Calculate days since last visit
  let daysSinceLastVisit = 0;
  if (customer.lastVisitDate) {
    daysSinceLastVisit = differenceInDays(new Date(), parseISO(customer.lastVisitDate));
  } else {
    const customerVisits = visits.filter(visit => visit.customerId === customer.id);
    if (customerVisits.length > 0) {
      const sortedVisits = [...customerVisits].sort((a, b) => 
        parseISO(b.date).getTime() - parseISO(a.date).getTime()
      );
      daysSinceLastVisit = differenceInDays(new Date(), parseISO(sortedVisits[0].date));
    } else {
      daysSinceLastVisit = 90; // Default high value if no visits
    }
  }
  
  // Status score (0-40)
  let statusScore = 0;
  switch (status) {
    case 'repeating-with-reservation':
      statusScore = 0;
      break;
    case 'repeating-no-reservation':
      statusScore = 10;
      break;
    case 'last-month-visited':
      statusScore = 20;
      break;
    case 'two-months-no-visit':
      statusScore = 30;
      break;
    case 'three-months-no-visit':
      statusScore = 40;
      break;
    case 'graduated':
      statusScore = 0;  // 卒業はリスクではない
      break;
  }
  
  // Days since last visit score (0-30)
  const daysScore = Math.min(30, Math.round((daysSinceLastVisit / 90) * 30));
  
  // Frequency change score (0-20)
  const freqScore = Math.min(20, Math.max(0, Math.round(freqChange * 0.2)));
  
  // Remaining visits score (0-10)
  const remainingScore = Math.round(
    (10 - Math.min(10, customer.contract.remainingVisits)) * 1
  );
  
  return Math.min(100, statusScore + daysScore + freqScore + remainingScore);
}

/**
 * Get follow-up priority (high, medium, low)
 */
export function getFollowUpPriority(riskScore: number): 'high' | 'medium' | 'low' {
  if (riskScore >= 70) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
}

/**
 * Get recommended follow-up method
 */
export function getRecommendedFollowUp(riskScore: number): string {
  if (riskScore >= 70) {
    return '至急電話連絡';
  } else if (riskScore >= 50) {
    return 'LINE連絡後、反応なければ電話';
  } else {
    return 'LINE連絡';
  }
}

/**
 * Check if customer visited in a specific month
 */
export function hasVisitedInMonth(customer: Customer, visits: Visit[], targetMonth: Date): boolean {
  const customerVisits = visits.filter(visit => visit.customerId === customer.id);
  const monthStart = startOfMonth(targetMonth);
  const monthEnd = endOfMonth(targetMonth);
  
  return customerVisits.some(visit => {
    const visitDate = parseISO(visit.date);
    return visitDate >= monthStart && visitDate <= monthEnd;
  });
}

/**
 * Check if customer has future reservation
 */
export function hasFutureReservation(customer: Customer, visits: Visit[]): boolean {
  const today = new Date();
  const customerVisits = visits.filter(visit => visit.customerId === customer.id);
  
  return customerVisits.some(visit => {
    const visitDate = parseISO(visit.date);
    return visitDate > today;
  });
}

/**
 * Get important customer segments
 */
export function getImportantSegments(customers: Customer[], visits: Visit[]) {
  const today = new Date();
  const thisMonth = today;
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  
  // (1) 先々月に来店されていて、先月と今月は来店されていない顧客
  const segment1 = customers.filter(customer => {
    const visitedTwoMonthsAgo = hasVisitedInMonth(customer, visits, twoMonthsAgo);
    const visitedLastMonth = hasVisitedInMonth(customer, visits, lastMonth);
    const visitedThisMonth = hasVisitedInMonth(customer, visits, thisMonth);
    
    return visitedTwoMonthsAgo && !visitedLastMonth && !visitedThisMonth;
  });
  
  // (2) 先月来店されていて、今月は来店または本日以降に次回予約が入っていない顧客
  const segment2 = customers.filter(customer => {
    const visitedLastMonth = hasVisitedInMonth(customer, visits, lastMonth);
    const visitedThisMonth = hasVisitedInMonth(customer, visits, thisMonth);
    const hasFutureRes = hasFutureReservation(customer, visits);
    
    return visitedLastMonth && !visitedThisMonth && !hasFutureRes;
  });
  
  // (3) リピート中であるが本日以降に次回予約が入っていない顧客
  const segment3 = customers.filter(customer => {
    const status = calculateCustomerStatus(customer, visits);
    const hasFutureRes = hasFutureReservation(customer, visits);
    
    return (status === 'repeating-with-reservation' || status === 'repeating-no-reservation') && !hasFutureRes;
  });
  
  return {
    twoMonthsNoVisit: segment1,     // 先々月来店→2ヶ月未来店
    lastMonthNoFollow: segment2,    // 先月来店→今月未来店・予約なし
    repeatingNoReservation: segment3 // リピート中→予約なし
  };
}