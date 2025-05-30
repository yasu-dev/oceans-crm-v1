import { Customer } from '../types/customer';
import { Visit } from '../types/visit';
import { Appointment } from '../types/appointment';
import { formatISO } from 'date-fns';

// Generate a random date within the last 90 days
const randomRecentDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 90));
  return formatISO(date);
};

// Generate a random date within the next 365 days
const randomFutureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 365) + 30);
  return formatISO(date);
};

// Generate random contract amount
const randomAmount = () => {
  const baseAmounts = [80000, 120000, 150000, 200000, 250000];
  return baseAmounts[Math.floor(Math.random() * baseAmounts.length)];
};

// Staff names
const staffNames = ['佐藤', '鈴木', '田中', '伊藤', '渡辺'];

// Course names
const courseNames = [
  '全身脱毛プラン',
  'フェイシャル脱毛コース',
  'VIO集中プラン',
  '上半身集中コース',
  '下半身集中コース'
];

// Japanese last names
const lastNames = [
  '佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
  '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '清水', '山崎'
];

// Japanese first names (female)
const firstNames = [
  '陽子', '美咲', '七海', '結衣', '花子', '真由美', '香織', '愛', '優子', '明美',
  '舞', '千尋', '遥', '桜', '裕子', '麻衣', '純子', '綾', '恵', '真理子'
];

// Mock customers (20 customers with realistic patterns)
export const mockCustomers: Customer[] = Array.from({ length: 20 }).map(
  (_, idx) => {
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    
    // Create more realistic remaining visits patterns
    let remainingVisits = 0;
    if (idx < 3) {
      remainingVisits = 0; // 卒業
    } else if (idx < 6) {
      remainingVisits = Math.floor(Math.random() * 3) + 1; // 1-3回 (契約終了間近)
    } else if (idx < 12) {
      remainingVisits = Math.floor(Math.random() * 5) + 4; // 4-8回 (中間)
    } else {
      remainingVisits = Math.floor(Math.random() * 4) + 8; // 8-11回 (新規に近い)
    }
    
    // Create realistic creation dates
    let createdAt: Date;
    if (idx < 3) {
      createdAt = randomDateInRange(180, 360); // 6-12ヶ月前（卒業組）
    } else if (idx < 8) {
      createdAt = randomDateInRange(90, 180); // 3-6ヶ月前
    } else if (idx < 15) {
      createdAt = randomDateInRange(30, 90); // 1-3ヶ月前
    } else {
      createdAt = randomDateInRange(0, 30); // 過去30日以内（新規）
    }
    
    return {
      id: `C-${String(Date.now()).slice(-8)}-${(idx + 1).toString().padStart(4, '0')}`,
      lastName,
      firstName,
      lastNameKana: lastName, // Simplified for mock data
      firstNameKana: firstName, // Simplified for mock data
      primaryStaff: staffNames[Math.floor(Math.random() * staffNames.length)],
      secondaryStaff: Math.random() > 0.7 ? staffNames[Math.floor(Math.random() * staffNames.length)] : undefined,
      contract: {
        course: courseNames[Math.floor(Math.random() * courseNames.length)],
        amount: randomAmount(),
        period: '12ヶ月',
        remainingVisits,
        startDate: randomRecentDate(),
        endDate: randomFutureDate(),
      },
      lastVisitDate: randomRecentDate(),
      notes: Math.random() > 0.7 ? '定期的な予約が好みです。' : undefined,
      phone: `090-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${lastName.toLowerCase()}.${firstName.toLowerCase()}@example.com`,
      createdAt: createdAt.toISOString(),
      updatedAt: randomRecentDate(),
    };
  }
);

// Helper function to create date in range
function randomDateInRange(daysAgoStart: number, daysAgoEnd: number): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * (daysAgoEnd - daysAgoStart)) + daysAgoStart;
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Create more realistic visit patterns for demo
export const mockVisits: Visit[] = [];

const currentDate = new Date();

mockCustomers.forEach((customer, idx) => {
  if (idx < 3) {
    // Pattern 1: 卒業（過去には定期的に通っていた）
    for (let i = 0; i < 10; i++) {
      const visitDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6 - i, Math.floor(Math.random() * 28) + 1);
      mockVisits.push({
        id: `V-${Date.now()}-${idx}-${i}`,
        customerId: customer.id,
        date: visitDate.toISOString().split('T')[0],
        notes: '施術完了',
        createdAt: visitDate.toISOString(),
      });
    }
  } else if (idx < 6) {
    // Pattern 2: 3ヶ月以上未来店（過去は通っていたが最近来ていない）
    const lastVisitMonthsAgo = Math.floor(Math.random() * 3) + 3; // 3-5ヶ月前
    const lastVisitDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - lastVisitMonthsAgo, Math.floor(Math.random() * 28) + 1);
    
    // 過去の来店履歴（12ヶ月前まで）
    for (let i = 0; i < 8; i++) {
      const visitDate = new Date(lastVisitDate);
      visitDate.setMonth(visitDate.getMonth() - i);
      mockVisits.push({
        id: `V-${Date.now()}-${idx}-${i}`,
        customerId: customer.id,
        date: visitDate.toISOString().split('T')[0],
        notes: '施術完了',
        createdAt: visitDate.toISOString(),
      });
    }
  } else if (idx < 9) {
    // Pattern 3: 先々月来店（2ヶ月未来店）
    const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, Math.floor(Math.random() * 28) + 1);
    mockVisits.push({
      id: `V-${Date.now()}-${idx}-1`,
      customerId: customer.id,
      date: twoMonthsAgo.toISOString().split('T')[0],
      notes: '施術完了',
      createdAt: twoMonthsAgo.toISOString(),
    });
    
    // さらに過去の来店履歴（12ヶ月前まで）
    for (let i = 1; i < 10; i++) {
      const visitDate = new Date(twoMonthsAgo);
      visitDate.setMonth(visitDate.getMonth() - i);
      mockVisits.push({
        id: `V-${Date.now()}-${idx}-${i+1}`,
        customerId: customer.id,
        date: visitDate.toISOString().split('T')[0],
        notes: '施術完了',
        createdAt: visitDate.toISOString(),
      });
    }
  } else if (idx < 12) {
    // Pattern 4: 先月来店（今月未来店・予約なし）
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, Math.floor(Math.random() * 28) + 1);
    mockVisits.push({
      id: `V-${Date.now()}-${idx}-1`,
      customerId: customer.id,
      date: lastMonth.toISOString().split('T')[0],
      notes: '施術完了',
      createdAt: lastMonth.toISOString(),
    });
    
    // 定期的な過去の来店履歴（12ヶ月前まで）
    for (let i = 1; i < 12; i++) {
      const visitDate = new Date(lastMonth);
      visitDate.setMonth(visitDate.getMonth() - i);
      mockVisits.push({
        id: `V-${Date.now()}-${idx}-${i+1}`,
        customerId: customer.id,
        date: visitDate.toISOString().split('T')[0],
        notes: '施術完了',
        createdAt: visitDate.toISOString(),
      });
    }
  } else if (idx < 15) {
    // Pattern 5: リピート中・予約なし（最近も来店している）
    const recentVisitDaysAgo = Math.floor(Math.random() * 20) + 5; // 5-25日前
    const recentVisit = new Date(currentDate);
    recentVisit.setDate(recentVisit.getDate() - recentVisitDaysAgo);
    
    mockVisits.push({
      id: `V-${Date.now()}-${idx}-1`,
      customerId: customer.id,
      date: recentVisit.toISOString().split('T')[0],
      notes: '施術完了',
      createdAt: recentVisit.toISOString(),
    });
    
    // 定期的な過去の来店履歴（月1-2回ペースで12ヶ月前まで）
    for (let i = 1; i < 15; i++) {
      const visitDate = new Date(recentVisit);
      visitDate.setDate(visitDate.getDate() - (i * 20 + Math.floor(Math.random() * 10)));
      if (visitDate > new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1)) {
        mockVisits.push({
          id: `V-${Date.now()}-${idx}-${i+1}`,
          customerId: customer.id,
          date: visitDate.toISOString().split('T')[0],
          notes: '施術完了',
          createdAt: visitDate.toISOString(),
        });
      }
    }
  } else {
    // Pattern 6: リピート中・予約あり（理想的な顧客）
    const recentVisitDaysAgo = Math.floor(Math.random() * 14) + 1; // 1-14日前
    const recentVisit = new Date(currentDate);
    recentVisit.setDate(recentVisit.getDate() - recentVisitDaysAgo);
    
    mockVisits.push({
      id: `V-${Date.now()}-${idx}-1`,
      customerId: customer.id,
      date: recentVisit.toISOString().split('T')[0],
      notes: '施術完了',
      createdAt: recentVisit.toISOString(),
    });
    
    // 未来の予約を追加
    const futureVisitDaysLater = Math.floor(Math.random() * 14) + 7; // 7-21日後
    const futureVisit = new Date(currentDate);
    futureVisit.setDate(futureVisit.getDate() + futureVisitDaysLater);
    
    mockVisits.push({
      id: `V-${Date.now()}-${idx}-future`,
      customerId: customer.id,
      date: futureVisit.toISOString().split('T')[0],
      notes: '次回予約',
      createdAt: currentDate.toISOString(),
    });
    
    // 定期的な過去の来店履歴（2-3週間ごとで12ヶ月前まで）
    for (let i = 1; i < 18; i++) {
      const visitDate = new Date(recentVisit);
      visitDate.setDate(visitDate.getDate() - (i * 18 + Math.floor(Math.random() * 7)));
      if (visitDate > new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1)) {
        mockVisits.push({
          id: `V-${Date.now()}-${idx}-${i+1}`,
          customerId: customer.id,
          date: visitDate.toISOString().split('T')[0],
          notes: '施術完了',
          createdAt: visitDate.toISOString(),
        });
      }
    }
  }
});

// 時期に応じて顧客の行動パターンを変える追加データ
// 過去6ヶ月前に活発だったが、最近は来店が減っている顧客のデータを追加
const sixMonthsAgo = new Date(currentDate);
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

// 顧客5-10について、6ヶ月前は頻繁に来店していたというデータを追加
for (let idx = 5; idx < 10; idx++) {
  const customer = mockCustomers[idx];
  
  // 6-12ヶ月前は月2回ペースで来店
  for (let monthOffset = 6; monthOffset < 12; monthOffset++) {
    for (let visitInMonth = 0; visitInMonth < 2; visitInMonth++) {
      const visitDate = new Date(currentDate);
      visitDate.setMonth(visitDate.getMonth() - monthOffset);
      visitDate.setDate(Math.floor(Math.random() * 28) + 1);
      
      mockVisits.push({
        id: `V-historical-${Date.now()}-${idx}-${monthOffset}-${visitInMonth}`,
        customerId: customer.id,
        date: visitDate.toISOString().split('T')[0],
        notes: '施術完了',
        createdAt: visitDate.toISOString(),
      });
    }
  }
}

// より現実的な変動を追加
// 1. 季節的な変動（夏場は来店が増え、年末年始は減る）
// 2. ビジネスの成長トレンド
// 3. 個別顧客の離脱パターン

// 過去12ヶ月分の追加訪問データを生成
for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
  const targetDate = new Date(currentDate);
  targetDate.setMonth(targetDate.getMonth() - monthOffset);
  
  // 季節係数（夏は1.3倍、冬は0.7倍）
  const month = targetDate.getMonth();
  let seasonalFactor = 1.0;
  if (month >= 5 && month <= 7) { // 6-8月（夏）
    seasonalFactor = 1.3;
  } else if (month >= 11 || month <= 1) { // 12-2月（冬）
    seasonalFactor = 0.7;
  }
  
  // 成長トレンド（過去になるほど顧客数が少ない）
  const growthFactor = 1.0 - (monthOffset * 0.05); // 月あたり5%の成長
  
  // 追加の来店データを生成
  const additionalVisits = Math.floor(10 * seasonalFactor * growthFactor);
  
  for (let v = 0; v < additionalVisits; v++) {
    const customerIndex = Math.floor(Math.random() * 15) + 5; // 顧客5-19
    if (customerIndex < mockCustomers.length) {
      const visitDate = new Date(targetDate);
      visitDate.setDate(Math.floor(Math.random() * 28) + 1);
      
      mockVisits.push({
        id: `V-seasonal-${monthOffset}-${v}`,
        customerId: mockCustomers[customerIndex].id,
        date: visitDate.toISOString().split('T')[0],
        notes: '施術完了',
        createdAt: visitDate.toISOString(),
      });
    }
  }
}

// 特定の顧客の離脱シミュレーション
// 顧客10-12: 3ヶ月前に急に来店が止まった
for (let idx = 10; idx < 13; idx++) {
  const customer = mockCustomers[idx];
  
  // 3-12ヶ月前は定期的に来店
  for (let monthOffset = 3; monthOffset < 12; monthOffset++) {
    const visitDate = new Date(currentDate);
    visitDate.setMonth(visitDate.getMonth() - monthOffset);
    visitDate.setDate(Math.floor(Math.random() * 28) + 1);
    
    mockVisits.push({
      id: `V-churn-${idx}-${monthOffset}`,
      customerId: customer.id,
      date: visitDate.toISOString().split('T')[0],
      notes: '施術完了',
      createdAt: visitDate.toISOString(),
    });
  }
}

// 顧客13-14: 徐々に来店頻度が減少
for (let idx = 13; idx < 15; idx++) {
  const customer = mockCustomers[idx];
  
  for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
    // 過去になるほど頻繁に来店
    const visitsInMonth = Math.max(0, Math.floor(3 - monthOffset * 0.25));
    
    for (let v = 0; v < visitsInMonth; v++) {
      const visitDate = new Date(currentDate);
      visitDate.setMonth(visitDate.getMonth() - monthOffset);
      visitDate.setDate(Math.floor(Math.random() * 28) + 1);
      
      mockVisits.push({
        id: `V-gradual-${idx}-${monthOffset}-${v}`,
        customerId: customer.id,
        date: visitDate.toISOString().split('T')[0],
        notes: '施術完了',
        createdAt: visitDate.toISOString(),
      });
    }
  }
}

// Generate mock appointment data
export const mockAppointments: Appointment[] = [];

// 予約生成のヘルパー関数
const generateAppointmentTime = (baseDate: Date, hour: number, duration: number = 90) => {
  const start = new Date(baseDate);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + duration);
  return { start, end };
};

// 今日の日付を基準に予約を生成
const today = new Date();
today.setHours(0, 0, 0, 0);

// 今日の予約を生成（重要）
for (let i = 0; i < 5; i++) {
  const customer = mockCustomers[i];
  const hour = 10 + i * 2; // 10:00, 12:00, 14:00, 16:00, 18:00
  const { start, end } = generateAppointmentTime(today, hour);
  
  mockAppointments.push({
    id: `A-today-${i}`,
    customerId: customer.id,
    customerName: `${customer.lastName}${customer.firstName}`,
    startTime: start,
    endTime: end,
    title: customer.contract.course,
    notes: i === 0 ? 'VIP顧客・特別対応' : i === 2 ? '初回カウンセリング含む' : undefined,
    status: 'scheduled',
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

// 明日の予約を生成
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

for (let i = 0; i < 3; i++) {
  const customer = mockCustomers[i + 5];
  const hour = 11 + i * 3; // 11:00, 14:00, 17:00
  const { start, end } = generateAppointmentTime(tomorrow, hour);
  
  mockAppointments.push({
    id: `A-tomorrow-${i}`,
    customerId: customer.id,
    customerName: `${customer.lastName}${customer.firstName}`,
    startTime: start,
    endTime: end,
    title: customer.contract.course,
    notes: i === 1 ? '遅刻連絡あり' : undefined,
    status: 'scheduled',
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

// 今週の残りの予約を生成
for (let dayOffset = 2; dayOffset < 7; dayOffset++) {
  const appointmentDate = new Date(today);
  appointmentDate.setDate(today.getDate() + dayOffset);
  
  // 各日2-4件の予約を生成
  const appointmentsPerDay = 2 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < appointmentsPerDay; i++) {
    const customerIndex = (dayOffset * 3 + i) % mockCustomers.length;
    const customer = mockCustomers[customerIndex];
    const hour = 10 + Math.floor(Math.random() * 8); // 10:00〜17:00
    const { start, end } = generateAppointmentTime(appointmentDate, hour);
    
    mockAppointments.push({
      id: `A-week-${dayOffset}-${i}`,
      customerId: customer.id,
      customerName: `${customer.lastName}${customer.firstName}`,
      startTime: start,
      endTime: end,
      title: customer.contract.course,
      notes: Math.random() > 0.7 ? 'リピート予約' : undefined,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

// 来週以降の予約を生成（週に10-15件程度）
for (let weekOffset = 1; weekOffset < 4; weekOffset++) {
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const appointmentDate = new Date(today);
    appointmentDate.setDate(today.getDate() + (weekOffset * 7) + dayOffset);
    
    // 週末は予約を少なめに
    const isWeekend = appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6;
    const appointmentsPerDay = isWeekend ? Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < appointmentsPerDay; i++) {
      const customerIndex = (weekOffset * 7 + dayOffset * 2 + i) % mockCustomers.length;
      const customer = mockCustomers[customerIndex];
      const hour = 10 + Math.floor(Math.random() * 8);
      const { start, end } = generateAppointmentTime(appointmentDate, hour);
      
      mockAppointments.push({
        id: `A-future-${weekOffset}-${dayOffset}-${i}`,
        customerId: customer.id,
        customerName: `${customer.lastName}${customer.firstName}`,
        startTime: start,
        endTime: end,
        title: customer.contract.course,
        notes: customerIndex % 5 === 0 ? 'VIPカスタマー' : undefined,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
}

// 過去の完了済み予約（先週分）
for (let dayOffset = -7; dayOffset < -1; dayOffset++) {
  const appointmentDate = new Date(today);
  appointmentDate.setDate(today.getDate() + dayOffset);
  
  const appointmentsPerDay = 2 + Math.floor(Math.random() * 2);
  
  for (let i = 0; i < appointmentsPerDay; i++) {
    const customerIndex = Math.abs(dayOffset * 2 + i) % mockCustomers.length;
    const customer = mockCustomers[customerIndex];
    const hour = 11 + Math.floor(Math.random() * 6);
    const { start, end } = generateAppointmentTime(appointmentDate, hour);
    
    mockAppointments.push({
      id: `A-past-${Math.abs(dayOffset)}-${i}`,
      customerId: customer.id,
      customerName: `${customer.lastName}${customer.firstName}`,
      startTime: start,
      endTime: end,
      title: customer.contract.course,
      status: 'completed',
      createdAt: appointmentDate,
      updatedAt: new Date()
    });
  }
}

// 今日のキャンセル済み予約も1件追加
const cancelledCustomer = mockCustomers[15];
const { start: cancelStart, end: cancelEnd } = generateAppointmentTime(today, 15);

mockAppointments.push({
  id: `A-cancelled-today`,
  customerId: cancelledCustomer.id,
  customerName: `${cancelledCustomer.lastName}${cancelledCustomer.firstName}`,
  startTime: cancelStart,
  endTime: cancelEnd,
  title: cancelledCustomer.contract.course,
  notes: '体調不良のためキャンセル',
  status: 'cancelled',
  createdAt: new Date(),
  updatedAt: new Date()
});