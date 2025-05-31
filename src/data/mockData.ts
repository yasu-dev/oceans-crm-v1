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
  const baseAmounts = [80000, 120000, 150000, 200000, 250000, 300000, 350000];
  return baseAmounts[Math.floor(Math.random() * baseAmounts.length)];
};

// Staff names
const staffNames = ['佐藤', '鈴木', '田中', '伊藤', '渡辺', '木村', '山田'];

// Course names
const courseNames = [
  '全身脱毛プラン',
  'フェイシャル脱毛コース',
  'VIO集中プラン',
  '上半身集中コース',
  '下半身集中コース',
  'プレミアム全身コース',
  'メンテナンスプラン'
];

// Japanese last names
const lastNames = [
  '佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
  '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '清水', '山崎',
  '森', '池田', '橋本', '阿部', '石川', '前田', '藤田', '小川', '岡田', '後藤'
];

// Japanese first names (female)
const firstNames = [
  '陽子', '美咲', '七海', '結衣', '花子', '真由美', '香織', '愛', '優子', '明美',
  '舞', '千尋', '遥', '桜', '裕子', '麻衣', '純子', '綾', '恵', '真理子',
  '美穂', '由美', '智子', '理恵', '彩', '奈々', '沙織', '友美', '瞳', '葵'
];

// Mock customers (30 customers with realistic patterns)
export const mockCustomers: Customer[] = Array.from({ length: 60 }).map(
  (_, idx) => {
    const lastName = lastNames[idx % lastNames.length];
    const firstName = firstNames[idx % firstNames.length];
    
    // ステータスを分散して設定
    let status: Customer['status'];
    let remainingVisits = 0;
    let contractAmount = randomAmount();
    const customerSegment = idx % 6; // 6つのセグメントに均等に割り当てる

    switch (customerSegment) {
      case 0: // 卒業 (10名)
        status = 'graduated';
        remainingVisits = 0;
        break;
      case 1: // 3ヶ月以上未来店 (10名) - 失客リスク高
        status = 'three-months-no-visit';
        remainingVisits = Math.floor(Math.random() * 3) + 1; // 残り回数少なめ
        contractAmount = [300000, 350000, 400000, 450000, 500000][Math.floor(Math.random() * 5)]; // 高額契約
        break;
      case 2: // 先々月来店(2ヶ月未来店) (10名)
        status = 'two-months-no-visit';
        remainingVisits = Math.floor(Math.random() * 4) + 2;
        contractAmount = [200000, 250000, 300000][Math.floor(Math.random() * 3)];
        break;
      case 3: // 先月来店(今月未来店) (10名)
        status = 'last-month-visited';
        remainingVisits = Math.floor(Math.random() * 5) + 3;
        break;
      case 4: // リピート中(予約あり) (10名)
        status = 'repeating-with-reservation';
        remainingVisits = Math.floor(Math.random() * 8) + 5; // 残り回数多め
        break;
      default: // リピート中(予約なし) (10名)
        status = 'repeating-no-reservation';
        remainingVisits = Math.floor(Math.random() * 6) + 4;
        break;
    }
    
    // Create realistic creation dates (2025年1月運用開始を想定)
    let createdAt: Date;
    if (status === 'graduated') {
      createdAt = randomDateInRange(180, 360); // 6-12ヶ月前（卒業組）
    } else if (status === 'three-months-no-visit') {
      createdAt = randomDateInRange(120, 240); // 4-8ヶ月前
    } else if (status === 'two-months-no-visit') {
      createdAt = randomDateInRange(90, 180); // 3-6ヶ月前
    } else if (status === 'last-month-visited') {
      createdAt = randomDateInRange(60, 120); // 2-4ヶ月前
    } else if (status === 'repeating-with-reservation') {
      createdAt = randomDateInRange(30, 90); // 1-3ヶ月前
    } else {
      createdAt = randomDateInRange(0, 60); // 過去60日以内
    }
    
    // 生年月日を20-45歳の範囲でランダムに生成
    const age = 20 + Math.floor(Math.random() * 25);
    const birthYear = new Date().getFullYear() - age;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const birthday = new Date(birthYear, birthMonth - 1, birthDay).toISOString();
    
    // 職業のバリエーション
    const occupations = ['会社員', '主婦', '学生', '自営業', '医療関係', '美容関係', '接客業', 'フリーランス', '公務員', '教育関係', 'ITエンジニア', 'クリエイター'];
    const occupation = occupations[idx % occupations.length];
    
    // 来店きっかけのバリエーション
    const storeVisitReasons = ['ホームページ', 'Instagram', '友人の紹介', 'チラシ', '通りがかり', 'Google検索', 'ホットペッパー', 'Twitter', 'Facebook', 'その他SNS', 'イベント'];
    const storeVisitReason = storeVisitReasons[idx % storeVisitReasons.length];
    
    // 肌の悩みのバリエーション
    const skinConcernsList = ['乾燥', '敏感肌', '脂性肌', '混合肌', 'ニキビ跡', 'シミ', '毛穴', 'くすみ', '赤み', 'たるみ', 'アトピー', 'そばかす'];
    const skinConcerns = skinConcernsList[idx % skinConcernsList.length];
    
    // 化粧品のバリエーション
    const cosmeticsList = ['SK-II', 'CHANEL', '資生堂', 'コスメデコルテ', 'ドラッグストアのもの', '特になし', 'オーガニック系', 'Dior', 'LANCOME'];
    const cosmetics = cosmeticsList[Math.floor(Math.random() * cosmeticsList.length)];
    
    // アレルギーのバリエーション
    const allergyList = ['なし', '花粉症', '金属アレルギー', '日光過敏症', 'アトピー性皮膚炎', '食物アレルギー（軽度）', 'ハウスダスト'];
    const physicalConditionAllergy = allergyList[Math.floor(Math.random() * allergyList.length)];
    
    // 脱毛経験のバリエーション
    const hairRemovalExperienceList = ['なし', 'あり（1年前）', 'あり（3年前）', 'あり（5年以上前）', 'あり（半年前）'];
    const hairRemovalExperience = hairRemovalExperienceList[Math.floor(Math.random() * hairRemovalExperienceList.length)];
    
    // 脱毛経験がある場合のサロン名
    const hairRemovalExperienceSalon = hairRemovalExperience !== 'なし' 
      ? ['ミュゼ', 'TBC', 'キレイモ', '銀座カラー', 'エピレ', 'ストラッシュ', 'ラココ'][Math.floor(Math.random() * 7)]
      : undefined;
    
    // セルフケアのバリエーション
    const selfCareList = ['カミソリ', '電気シェーバー', '除毛クリーム', 'ワックス', '毛抜き', 'なし', '家庭用脱毛器'];
    const selfCareHairRemoval = selfCareList[Math.floor(Math.random() * selfCareList.length)];
    
    return {
      id: `C-${String(Date.now()).slice(-8)}-${(idx + 1).toString().padStart(4, '0')}`,
      lastName,
      firstName,
      lastNameKana: lastName + 'カナ', // Simplified for mock data
      firstNameKana: firstName + 'カナ', // Simplified for mock data
      primaryStaff: staffNames[idx % staffNames.length],
      secondaryStaff: Math.random() > 0.5 ? staffNames[(idx + 1) % staffNames.length] : undefined,
      contract: {
        course: courseNames[idx % courseNames.length],
        amount: contractAmount,
        period: ['6ヶ月', '12ヶ月', '18ヶ月', '24ヶ月'][Math.floor(Math.random() * 4)],
        remainingVisits,
        startDate: createdAt.toISOString(),
        endDate: randomFutureDate(),
      },
      lastVisitDate: randomRecentDate(),
      notes: Math.random() > 0.6 ? ['定期的な予約が好みです。', '施術後の赤みに注意', '痛みに敏感なため出力調整必要', '効果を実感していただいている'][Math.floor(Math.random() * 4)] : undefined,
      phone: `090-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${lastName.toLowerCase()}.${firstName.toLowerCase()}@example.com`,
      createdAt: createdAt.toISOString(),
      updatedAt: randomRecentDate(),
      lineId: `U${String(Date.now()).slice(-10)}${idx}`,
      postalCode: `${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      prefecture: ['東京都', '神奈川県', '千葉県', '埼玉県'][Math.floor(Math.random() * 4)],
      city: ['渋谷区', '新宿区', '港区', '世田谷区', '目黒区', '品川区'][Math.floor(Math.random() * 6)],
      address1: `${Math.floor(Math.random()*10)}-${Math.floor(Math.random()*10)}-${Math.floor(Math.random()*10)}`,
      gender: 'female',
      birthday,
      occupation,
      occupationDetail: occupation === '会社員' ? ['大手商社勤務', 'IT企業勤務', '金融機関勤務', '広告代理店勤務'][Math.floor(Math.random() * 4)] : 
                       occupation === '医療関係' ? ['看護師', '医師', '薬剤師', '理学療法士'][Math.floor(Math.random() * 4)] : 
                       occupation === '美容関係' ? ['ネイリスト', 'エステティシャン', '美容師', 'メイクアップアーティスト'][Math.floor(Math.random() * 4)] : undefined,
      storeVisitReason,
      storeVisitReasonDetail: storeVisitReason === '友人の紹介' ? `${lastNames[Math.floor(Math.random() * lastNames.length)]}様からのご紹介` : undefined,
      physicalConditionAllergy,
      physicalConditionAllergyDetail: physicalConditionAllergy === '花粉症' ? '春季のみ、薬服用中' : 
                                     physicalConditionAllergy === 'アトピー性皮膚炎' ? '軽度、保湿剤使用' : undefined,
      cosmetics,
      cosmeticsDetail: cosmetics === 'オーガニック系' ? '敏感肌用を中心に使用' : undefined,
      skinConcerns,
      skinConcernsDetail: skinConcerns === '乾燥' ? '特に冬場がひどく、保湿を重視' : 
                         skinConcerns === 'ニキビ跡' ? '頬に少し残っている程度' : undefined,
      pregnancy: Math.random() > 0.95 ? '妊娠中' : 'なし',
      pregnancyDetail: undefined,
      children: Math.random() > 0.6 ? 'あり' : 'なし',
      childrenDetail: undefined,
      medicalHistory: Math.random() > 0.8 ? 'あり' : 'なし',
      medicalHistoryDetail: undefined,
      medication: Math.random() > 0.8 ? 'あり' : 'なし',
      medicationDetail: undefined,
      selfCareHairRemoval,
      selfCareHairRemovalDetail: selfCareHairRemoval === 'カミソリ' ? '週2-3回程度' : 
                                selfCareHairRemoval === '電気シェーバー' ? '毎日使用' : undefined,
      hairRemovalExperience,
      hairRemovalExperienceSalon,
      hairRemovalExperienceDetail: hairRemovalExperience !== 'なし' ? '効果はあったが、通いきれなかった' : undefined,
      hairRemovalTrouble: Math.random() > 0.9 ? 'あり' : 'なし',
      hairRemovalTroubleDetail: undefined,
      idealBeautyImage: ['ツルツル肌を目指したい', '自己処理の手間を減らしたい', '肌荒れを改善したい', '清潔感を保ちたい', '美肌効果も期待したい'][Math.floor(Math.random() * 5)],
      comment: customerSegment === 0 ? '卒業されたお客様。アンケートにもご協力いただきました。' :
              customerSegment === 1 ? '長期間ご来店がありません。丁寧なフォローアップが必要です。高額契約者です。' :
              customerSegment === 2 ? '2ヶ月間ご来店がありません。キャンペーンの案内などを検討しましょう。' :
              customerSegment === 3 ? '先月ご来店いただきました。次回の予約促進が必要です。' :
              customerSegment === 4 ? '定期的にご予約いただいています。優良顧客です。' :
              '予約が途切れています。積極的なアプローチを検討してください。',
      nextAppointmentNote: Math.random() > 0.5 ? ['次回はVIOの施術を重点的に', '肌の調子が良いので出力を少し上げる提案', '予約変更の可能性があるため前日に確認連絡'][Math.floor(Math.random() * 3)] : undefined,
      previousAppointmentNote: Math.random() > 0.5 ? ['前回は少し赤みが出たため保湿を入念に実施', '効果を大変実感していただけた様子', '施術後のハーブティーがお気に入り'][Math.floor(Math.random() * 3)] : undefined,
      contractor: staffNames[(idx + 2) % staffNames.length],
      introducer: Math.random() > 0.4 ? `${lastNames[(idx + 3) % lastNames.length]}様` : undefined,
      status,
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

// Generate visits for customers (more realistic patterns)
export const mockVisits: Visit[] = mockCustomers.flatMap((customer, idx) => {
  // 卒業した顧客は多めの来店履歴、新規顧客は少なめ
  let visitCount: number;
  const customerSegment = idx % 6;

  switch (customerSegment) {
    case 0: // 卒業
      visitCount = Math.floor(Math.random() * 10) + 15; // 15-25 visits
      break;
    case 1: // 3ヶ月以上未来店
      visitCount = Math.floor(Math.random() * 5) + 10;  // 10-15 visits
      break;
    case 2: // 先々月来店(2ヶ月未来店)
      visitCount = Math.floor(Math.random() * 5) + 8;   // 8-13 visits
      break;
    case 3: // 先月来店(今月未来店)
      visitCount = Math.floor(Math.random() * 4) + 5;   // 5-9 visits
      break;
    case 4: // リピート中(予約あり)
      visitCount = Math.floor(Math.random() * 3) + 3;   // 3-6 visits
      break;
    default: // リピート中(予約なし)
      visitCount = Math.floor(Math.random() * 2) + 2;   // 2-4 visits
      break;
  }
  
  const treatmentContents = [
    '全身脱毛コース',
    'VIO脱毛',
    '顔脱毛',
    'ワキ脱毛',
    '腕・脚脱毛',
    'メンテナンス脱毛',
    '背中脱毛',
    'うなじ脱毛'
  ];
  
  const paymentMethods = ['現金', 'クレジットカード', 'PayPay', '銀行振込', '分割払い', 'LINE Pay'];
  
  return Array.from({ length: visitCount }).map((_, vIdx) => {
    // より現実的な来店間隔（2-4週間）
    const weeksAgo = (visitCount - vIdx - 1) * 3 + Math.floor(Math.random() * 2);
    const date = new Date();
    date.setDate(date.getDate() - (weeksAgo * 7));
    
    const visitHour = 10 + Math.floor(Math.random() * 9); // 10:00-18:00
    const visitMinute = Math.random() > 0.5 ? 0 : 30;
    const duration = 60 + Math.floor(Math.random() * 4) * 30; // 60-180 minutes
    
    const visitTime = `${visitHour}:${visitMinute.toString().padStart(2, '0')}`;
    const leaveHour = Math.floor((visitHour * 60 + visitMinute + duration) / 60);
    const leaveMinute = (visitHour * 60 + visitMinute + duration) % 60;
    const leaveTime = `${leaveHour}:${leaveMinute.toString().padStart(2, '0')}`;
    
    const visitNotes = [
      '施術後の肌の状態良好。次回も同じ出力で。',
      '少し赤みが出たため、次回は出力を下げる。',
      '効果を実感していただけている様子。',
      '痛みの訴えあり。冷却を強めに。',
      '予定通り施術完了。経過良好。',
      '次回から出力を上げても問題なさそう。'
    ];
    
    return {
      id: `V-${customer.id}-${vIdx + 1}`,
      customerId: customer.id,
      date: date.toISOString().split('T')[0],
      notes: Math.random() > 0.6 ? visitNotes[Math.floor(Math.random() * visitNotes.length)] : undefined,
      createdAt: date.toISOString(),
      staffName: customer.primaryStaff || staffNames[Math.floor(Math.random() * staffNames.length)],
      treatmentContent: treatmentContents[Math.floor(Math.random() * treatmentContents.length)],
      visitTime,
      leaveTime,
      amount: Math.floor(Math.random() * 25 + 10) * 1000, // 10,000-35,000円
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// Generate mock appointment data (2025年1月を想定)
export const mockAppointments: Appointment[] = (() => {
  const appointments: Appointment[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const menus = [
    { name: '全身脱毛コース', price: 28000 },
    { name: 'VIO脱毛', price: 15000 },
    { name: '顔脱毛', price: 12000 },
    { name: 'ワキ脱毛', price: 8000 },
    { name: '腕・脚脱毛', price: 18000 },
    { name: 'メンテナンス脱毛', price: 10000 },
    { name: '背中脱毛', price: 20000 },
    { name: 'うなじ脱毛', price: 10000 }
  ];
  
  // Create appointments for the next 2 weeks and previous week for completed ones
  for (let dayOffset = -7; dayOffset <= 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    
    // Skip Sundays
    if (date.getDay() === 0) continue;
    
    // 土曜日は予約多め、平日は通常
    const appointmentsPerDay = date.getDay() === 6 
      ? Math.floor(Math.random() * 4) + 6  // 6-9 appointments on Saturday (少し減らす)
      : Math.floor(Math.random() * 3) + 4; // 4-6 appointments on weekdays (少し減らす)
    
    for (let i = 0; i < appointmentsPerDay; i++) {
      // 予約ありステータスの顧客を優先的に割り当てる
      const potentialCustomers = mockCustomers.filter(c => c.status === 'repeating-with-reservation');
      let customer: Customer;
      if (potentialCustomers.length > 0 && Math.random() < 0.7) { // 70%の確率で予約あり顧客から選択
        customer = potentialCustomers[Math.floor(Math.random() * potentialCustomers.length)];
      } else {
        customer = mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
      }

      const hour = Math.floor(Math.random() * 9) + 10; // 10:00-18:00
      const minutes = [0, 15, 30, 45];
      const minute = minutes[Math.floor(Math.random() * minutes.length)];
      const startTime = new Date(date);
      startTime.setHours(hour, minute, 0, 0);
      
      const durationOptions = [60, 90, 120, 150]; // 施術時間を多様化
      const duration = durationOptions[Math.floor(Math.random() * durationOptions.length)];
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      const selectedMenu = menus[Math.floor(Math.random() * menus.length)];
      
      const appointmentNotes = [
        '前回の施術から3週間経過',
        '初回カウンセリング含む',
        'VIOの追加施術希望',
        '時間厳守でお願いします',
        '施術後に次回予約の相談',
        '敏感肌のため注意'
      ];
      
      appointments.push({
        id: `APT-${date.toISOString().split('T')[0]}-${i + 1}`,
        customerId: customer.id,
        customerName: `${customer.lastName} ${customer.firstName}`,
        startTime,
        endTime,
        title: `${customer.lastName} ${customer.firstName}`,
        notes: Math.random() > 0.6 ? appointmentNotes[Math.floor(Math.random() * appointmentNotes.length)] : undefined,
        status: dayOffset < 0 ? 'completed' : (dayOffset === 0 && startTime.getTime() < today.getTime()) ? 'completed' : 'scheduled',
        createdAt: new Date(new Date(startTime).setDate(startTime.getDate() - Math.floor(Math.random() * 14))), // 作成日を予約日より前に
        updatedAt: new Date(new Date(startTime).setDate(startTime.getDate() - Math.floor(Math.random() * 7))), // 更新日を予約日より前に
        staffName: customer.primaryStaff || staffNames[Math.floor(Math.random() * staffNames.length)],
        menu: selectedMenu.name,
        price: selectedMenu.price,
      });
    }
  }
  
  return appointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
})();