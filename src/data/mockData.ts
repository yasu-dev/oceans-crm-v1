import { Customer } from '../types/customer';
import { Visit } from '../types/visit';
import { Appointment } from '../types/appointment';
import { formatISO, addMonths, subMonths, addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';

// Generate a random date within a specific range
const randomDateInRange = (startDate: Date, endDate: Date): Date => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
};

// Generate random contract amount
const randomAmount = () => {
  const baseAmounts = [80000, 120000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000];
  return baseAmounts[Math.floor(Math.random() * baseAmounts.length)];
};

// Staff names
const staffNames = ['佐藤', '鈴木', '田中', '伊藤', '渡辺', '木村', '山田', '高橋', '中村', '小林'];

// Course names
const courseNames = [
  '全身脱毛プラン',
  'フェイシャル脱毛コース',
  'VIO集中プラン',
  '上半身集中コース',
  '下半身集中コース',
  'プレミアム全身コース',
  'メンテナンスプラン',
  '部分脱毛プラン',
  'スペシャルケアコース',
  '美肌脱毛プラン'
];

// Japanese last names
const lastNames = [
  '佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
  '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '清水', '山崎',
  '森', '池田', '橋本', '阿部', '石川', '前田', '藤田', '小川', '岡田', '後藤',
  '長谷川', '石井', '村上', '近藤', '坂本', '遠藤', '青木', '藤井', '西村', '福田',
  '太田', '三浦', '藤原', '岡本', '松田', '中川', '中野', '原田', '小野', '竹内'
];

// Japanese first names (female)
const firstNames = [
  '陽子', '美咲', '七海', '結衣', '花子', '真由美', '香織', '愛', '優子', '明美',
  '舞', '千尋', '遥', '桜', '裕子', '麻衣', '純子', '綾', '恵', '真理子',
  '美穂', '由美', '智子', '理恵', '彩', '奈々', '沙織', '友美', '瞳', '葵',
  '涼子', '絵美', '菜々子', '美紀', '千夏', '亜美', '由香', '里奈', '美優', '咲',
  '美和', '千佳', '恵美', '麻美', '真奈美', '由紀', '千晶', '美里', '奈緒', '香'
];

// 新しいステータス分布に基づくモックデータ生成（合計180件）
export const mockCustomers: Customer[] = Array.from({ length: 180 }).map(
  (_, idx) => {
    const lastName = lastNames[idx % lastNames.length];
    const firstName = firstNames[idx % firstNames.length];
    
    // ステータスを指定された件数に分散して設定
    let status: Customer['status'];
    let remainingVisits = 0;
    let contractAmount = randomAmount();
    let createdAt: Date;
    let lastVisitDate: Date | undefined;
    
    const now = new Date();
    
    // 指定されたステータス分布に基づく割り当て
    if (idx < 52) { 
      // 先月来店(今月未来店)：52件
      status = 'last-month-visited';
      remainingVisits = Math.floor(Math.random() * 8) + 3;
      // 損失額調整のため、一部の顧客の契約金額を高めに設定
      if (idx < 10) {
        contractAmount = [300000, 350000, 400000][Math.floor(Math.random() * 3)];
      }
      createdAt = randomDateInRange(subMonths(now, 4), subMonths(now, 2));
      // 先月のランダムな日付
      const lastMonth = subMonths(now, 1);
      lastVisitDate = randomDateInRange(startOfMonth(lastMonth), endOfMonth(lastMonth));
    } else if (idx < 75) { 
      // 先々月来店(2ヶ月未来店)：23件
      status = 'two-months-no-visit';
      remainingVisits = Math.floor(Math.random() * 6) + 2;
      // 損失額調整のため、契約金額を高めに設定
      contractAmount = [250000, 300000, 350000, 400000, 450000][Math.floor(Math.random() * 5)];
      createdAt = randomDateInRange(subMonths(now, 6), subMonths(now, 3));
      // 先々月のランダムな日付
      const twoMonthsAgo = subMonths(now, 2);
      lastVisitDate = randomDateInRange(startOfMonth(twoMonthsAgo), endOfMonth(twoMonthsAgo));
    } else if (idx < 114) { 
      // リピート中(予約あり)：39件
      status = 'repeating-with-reservation';
      remainingVisits = Math.floor(Math.random() * 10) + 5; // 残り回数多め
      createdAt = randomDateInRange(subMonths(now, 3), subMonths(now, 1));
      // 最近の来店（過去2週間以内）
      lastVisitDate = randomDateInRange(subDays(now, 14), subDays(now, 1));
    } else if (idx < 138) { 
      // リピート中(予約なし)：24件
      status = 'repeating-no-reservation';
      remainingVisits = Math.floor(Math.random() * 7) + 3;
      createdAt = randomDateInRange(subMonths(now, 3), subMonths(now, 1));
      // 最近の来店（過去3週間以内）
      lastVisitDate = randomDateInRange(subDays(now, 21), subDays(now, 7));
    } else if (idx < 155) { 
      // 3ヶ月以上未来店：17件
      status = 'three-months-no-visit';
      remainingVisits = Math.floor(Math.random() * 8) + 5; // 残り回数を増やして損失額を上げる
      // 高額契約で潜在的損失額を上げる
      contractAmount = [400000, 450000, 500000, 550000, 600000][Math.floor(Math.random() * 5)];
      createdAt = randomDateInRange(subMonths(now, 8), subMonths(now, 4));
      // 3ヶ月以上前のランダムな日付
      lastVisitDate = randomDateInRange(subMonths(now, 6), subMonths(now, 3));
    } else { 
      // 卒業：25件
      status = 'graduated';
      remainingVisits = 0; // 残り回数ゼロ
      contractAmount = [400000, 450000, 500000, 600000][Math.floor(Math.random() * 4)]; // 高額契約完了
      createdAt = randomDateInRange(subMonths(now, 12), subMonths(now, 6));
      // 1ヶ月以内の最終来店
      lastVisitDate = randomDateInRange(subMonths(now, 1), now);
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
        endDate: addMonths(createdAt, 12 + Math.floor(Math.random() * 12)).toISOString(),
      },
      lastVisitDate: lastVisitDate ? formatISO(lastVisitDate, { representation: 'date' }) : undefined,
      notes: Math.random() > 0.6 ? 
        (status === 'graduated' ? '施術完了。大変満足していただけました。' :
        status === 'three-months-no-visit' ? '連絡がつきにくい状況です。' :
        status === 'two-months-no-visit' ? '次回予約を検討中とのこと。' :
        status === 'repeating-no-reservation' ? '予約が取りづらいとのお声あり。' :
        status === 'repeating-with-reservation' ? '定期的にご来店いただいています。' :
        '施術の効果を実感していただいています。') : undefined,
      phone: `090-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${lastName.toLowerCase()}.${firstName.toLowerCase()}@example.com`,
      createdAt: createdAt.toISOString(),
      updatedAt: lastVisitDate ? lastVisitDate.toISOString() : createdAt.toISOString(),
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
      comment: status === 'graduated' ? '全コース完了。大変満足していただけました。メンテナンスコースのご案内済み。' :
              status === 'three-months-no-visit' ? '長期間ご来店がありません。フォローアップが必要です。高額契約のお客様です。' :
              status === 'two-months-no-visit' ? '2ヶ月間ご来店がありません。キャンペーンの案内を検討しましょう。' :
              status === 'last-month-visited' ? '先月ご来店いただきました。次回の予約促進が必要です。' :
              status === 'repeating-with-reservation' ? '定期的にご予約いただいています。優良顧客です。' :
              status === 'repeating-no-reservation' ? '継続的に通われていますが、次回予約がありません。予約の促進が必要です。' :
              '継続的な施術が順調に進んでいます。',
      nextAppointmentNote: status === 'repeating-with-reservation' ? 
        ['次回はVIOの施術を重点的に', '肌の調子が良いので出力を少し上げる提案', '予約変更の可能性があるため前日に確認連絡'][Math.floor(Math.random() * 3)] : undefined,
      previousAppointmentNote: Math.random() > 0.5 ? ['前回は少し赤みが出たため保湿を入念に実施', '効果を大変実感していただけた様子', '施術後のハーブティーがお気に入り'][Math.floor(Math.random() * 3)] : undefined,
      contractor: staffNames[(idx + 2) % staffNames.length],
      introducer: Math.random() > 0.4 ? `${lastNames[(idx + 3) % lastNames.length]}様` : undefined,
      status,
    };
  }
);

// Generate visits for customers (more realistic patterns)
export const mockVisits: Visit[] = mockCustomers.flatMap((customer) => {
  // 各ステータスに応じた来店履歴を生成
  let visitCount: number;
  const visits: Visit[] = [];
  
  // 2025年1月から6月までの期間設定
  const startDate = new Date(2025, 0, 1); // 2025年1月1日
  const endDate = new Date(2025, 5, 30); // 2025年6月30日
  const now = new Date();
  
  if (customer.status === 'graduated') {
    visitCount = Math.floor(Math.random() * 8) + 12; // 12-20 visits (卒業者は多い)
  } else if (customer.status === 'last-month-visited') {
    visitCount = Math.floor(Math.random() * 4) + 5;   // 5-9 visits
  } else if (customer.status === 'two-months-no-visit') {
    visitCount = Math.floor(Math.random() * 5) + 6;   // 6-11 visits
  } else if (customer.status === 'repeating-with-reservation') {
    visitCount = Math.floor(Math.random() * 4) + 4;   // 4-8 visits
  } else if (customer.status === 'repeating-no-reservation') {
    visitCount = Math.floor(Math.random() * 3) + 3;   // 3-6 visits
  } else if (customer.status === 'three-months-no-visit') {
    visitCount = Math.floor(Math.random() * 5) + 8;  // 8-13 visits
  } else {
    visitCount = Math.floor(Math.random() * 2) + 2;   // 2-4 visits
  }
  
  const treatmentContents = [
    '全身脱毛コース',
    'VIO脱毛',
    '顔脱毛',
    'ワキ脱毛',
    '腕・脚脱毛',
    'メンテナンス脱毛',
    '背中脱毛',
    'うなじ脱毛',
    '部分脱毛',
    'スペシャルケア'
  ];
  
  const paymentMethods = ['現金', 'クレジットカード', 'PayPay', '銀行振込', '分割払い', 'LINE Pay', 'QRコード決済'];
  
  // 各顧客の契約開始日を基準に来店日を生成
  const contractStartDate = new Date(customer.contract.startDate);
  
  for (let vIdx = 0; vIdx < visitCount; vIdx++) {
    // 来店間隔（2-5週間）をランダムに設定
    const weeksInterval = 2 + Math.floor(Math.random() * 4);
    const visitDate = new Date(contractStartDate);
    visitDate.setDate(visitDate.getDate() + (vIdx * weeksInterval * 7) + Math.floor(Math.random() * 7));
    
    // 2025年1月から6月の範囲内に収める
    if (visitDate < startDate) visitDate.setTime(startDate.getTime());
    if (visitDate > endDate) continue;
    
    // ステータスに応じて最終来店日を調整
    if (customer.status === 'last-month-visited' && vIdx === visitCount - 1) {
      // 先月来店の場合、最後の来店を先月に設定
      const lastMonth = subMonths(now, 1);
      visitDate.setTime(randomDateInRange(startOfMonth(lastMonth), endOfMonth(lastMonth)).getTime());
    } else if (customer.status === 'two-months-no-visit' && vIdx === visitCount - 1) {
      // 先々月来店の場合
      const twoMonthsAgo = subMonths(now, 2);
      visitDate.setTime(randomDateInRange(startOfMonth(twoMonthsAgo), endOfMonth(twoMonthsAgo)).getTime());
    } else if (customer.status === 'three-months-no-visit' && vIdx === visitCount - 1) {
      // 3ヶ月以上未来店の場合
      const threeMonthsAgo = subMonths(now, 3);
      const sixMonthsAgo = subMonths(now, 6);
      visitDate.setTime(randomDateInRange(sixMonthsAgo, threeMonthsAgo).getTime());
    }
    
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
      '次回から出力を上げても問題なさそう。',
      'お客様より効果に満足とのお声をいただきました。',
      '施術部位を変更希望。次回はVIO中心に。',
      '肌の調子が良いため、出力を少し上げました。'
    ];
    
    visits.push({
      id: `V-${customer.id}-${vIdx + 1}`,
      customerId: customer.id,
      date: formatISO(visitDate, { representation: 'date' }),
      notes: Math.random() > 0.6 ? visitNotes[Math.floor(Math.random() * visitNotes.length)] : undefined,
      createdAt: visitDate.toISOString(),
      staffName: customer.primaryStaff || staffNames[Math.floor(Math.random() * staffNames.length)],
      treatmentContent: treatmentContents[Math.floor(Math.random() * treatmentContents.length)],
      visitTime,
      leaveTime,
      amount: Math.floor(Math.random() * 30 + 10) * 1000, // 10,000-40,000円
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    });
  }
  
  return visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// Generate mock appointment data (2025年1月から6月)
export const mockAppointments: Appointment[] = (() => {
  const appointments: Appointment[] = [];
  const startDate = new Date(2025, 0, 1); // 2025年1月1日
  const endDate = new Date(2025, 5, 30); // 2025年6月30日
  const today = new Date();
  
  const menus = [
    { name: '全身脱毛コース', price: 28000 },
    { name: 'VIO脱毛', price: 15000 },
    { name: '顔脱毛', price: 12000 },
    { name: 'ワキ脱毛', price: 8000 },
    { name: '腕・脚脱毛', price: 18000 },
    { name: 'メンテナンス脱毛', price: 10000 },
    { name: '背中脱毛', price: 20000 },
    { name: 'うなじ脱毛', price: 10000 },
    { name: '部分脱毛', price: 15000 },
    { name: 'スペシャルケアコース', price: 35000 }
  ];
  
  // リピート中(予約あり)の顧客を取得
  const customersWithReservation = mockCustomers.filter(c => c.status === 'repeating-with-reservation');
  const otherActiveCustomers = mockCustomers.filter(c => 
    c.status === 'repeating-no-reservation' || 
    c.status === 'last-month-visited'
  );
  
  // 各月の予約を生成
  for (let month = 0; month < 6; month++) {
    const monthStart = new Date(2025, month, 1);
    const monthEnd = new Date(2025, month + 1, 0);
    
    // 予約あり顧客の予約を優先的に生成
    customersWithReservation.forEach((customer, index) => {
      // 各顧客は月に1-2回の予約
      const appointmentsPerMonth = Math.random() > 0.5 ? 2 : 1;
      
      for (let a = 0; a < appointmentsPerMonth; a++) {
        const appointmentDate = randomDateInRange(monthStart, monthEnd);
        
        // 土日を避ける（50%の確率）
        if (Math.random() > 0.5 && appointmentDate.getDay() === 0) {
          appointmentDate.setDate(appointmentDate.getDate() + 1);
        }
        if (Math.random() > 0.5 && appointmentDate.getDay() === 6) {
          appointmentDate.setDate(appointmentDate.getDate() - 1);
        }
        
        const hour = Math.floor(Math.random() * 8) + 10; // 10:00-17:00
        const minutes = [0, 15, 30, 45];
        const minute = minutes[Math.floor(Math.random() * minutes.length)];
        const startTime = new Date(appointmentDate);
        startTime.setHours(hour, minute, 0, 0);
        
        const durationOptions = [60, 90, 120]; // 施術時間
        const duration = durationOptions[Math.floor(Math.random() * durationOptions.length)];
        const endTime = new Date(startTime.getTime() + duration * 60000);
        
        const selectedMenu = menus[Math.floor(Math.random() * menus.length)];
        
        const appointmentNotes = [
          '前回の施術から3週間経過',
          '施術後に次回予約の相談',
          'VIOの追加施術希望',
          '肌の調子を見ながら出力調整',
          '定期メンテナンス',
          'お友達紹介の相談あり'
        ];
        
        // 現在より過去の予約は完了済み、未来の予約はscheduled
        const status = startTime < today ? 'completed' : 'scheduled';
        
        appointments.push({
          id: `APT-${appointmentDate.toISOString().split('T')[0]}-${customer.id}-${a + 1}`,
          customerId: customer.id,
          customerName: `${customer.lastName} ${customer.firstName}`,
          startTime,
          endTime,
          title: `${customer.lastName} ${customer.firstName}`,
          notes: Math.random() > 0.4 ? appointmentNotes[Math.floor(Math.random() * appointmentNotes.length)] : undefined,
          status,
          createdAt: new Date(startTime.getTime() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000), // 予約日の最大2週間前に作成
          updatedAt: new Date(startTime.getTime() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000), // 予約日の最大1週間前に更新
          staffName: customer.primaryStaff || staffNames[Math.floor(Math.random() * staffNames.length)],
          menu: selectedMenu.name,
          price: selectedMenu.price,
        });
      }
    });
    
    // その他のアクティブな顧客からもランダムに予約を生成
    const additionalAppointmentsCount = Math.floor(Math.random() * 10) + 5; // 月に5-15件の追加予約
    
    for (let i = 0; i < additionalAppointmentsCount; i++) {
      const customer = otherActiveCustomers[Math.floor(Math.random() * otherActiveCustomers.length)];
      const appointmentDate = randomDateInRange(monthStart, monthEnd);
      
      // 営業日（月曜〜土曜）に設定
      while (appointmentDate.getDay() === 0) {
        appointmentDate.setDate(appointmentDate.getDate() + 1);
      }
      
      const hour = Math.floor(Math.random() * 8) + 10; // 10:00-17:00
      const minutes = [0, 15, 30, 45];
      const minute = minutes[Math.floor(Math.random() * minutes.length)];
      const startTime = new Date(appointmentDate);
      startTime.setHours(hour, minute, 0, 0);
      
      const durationOptions = [60, 90, 120, 150]; // 施術時間
      const duration = durationOptions[Math.floor(Math.random() * durationOptions.length)];
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      const selectedMenu = menus[Math.floor(Math.random() * menus.length)];
      
      const appointmentNotes = [
        '久しぶりのご来店',
        '初回カウンセリング含む',
        'キャンペーン利用',
        '時間厳守でお願いします',
        '施術部位の相談あり',
        '敏感肌のため注意'
      ];
      
      // 現在より過去の予約は完了済み、未来の予約はscheduled
      const status = startTime < today ? 'completed' : 'scheduled';
      
      appointments.push({
        id: `APT-${appointmentDate.toISOString().split('T')[0]}-${i + 1}`,
        customerId: customer.id,
        customerName: `${customer.lastName} ${customer.firstName}`,
        startTime,
        endTime,
        title: `${customer.lastName} ${customer.firstName}`,
        notes: Math.random() > 0.5 ? appointmentNotes[Math.floor(Math.random() * appointmentNotes.length)] : undefined,
        status,
        createdAt: new Date(startTime.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // 予約日の最大30日前に作成
        updatedAt: new Date(startTime.getTime() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000), // 予約日の最大1週間前に更新
        staffName: customer.primaryStaff || staffNames[Math.floor(Math.random() * staffNames.length)],
        menu: selectedMenu.name,
        price: selectedMenu.price,
      });
    }
  }
  
  // 時系列順にソート
  return appointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
})();

// 5月31日の予約を5件追加（デモ用）
(() => {
  const may31 = new Date(2025, 4, 31); // 2025年5月31日
  const demoCustomers = mockCustomers.filter(c => 
    c.status === 'repeating-with-reservation' || 
    c.status === 'repeating-no-reservation' ||
    c.status === 'last-month-visited'
  ).slice(0, 5); // 最初の5人を選択
  
  // 既存の5/31の予約を削除
  const existingAppointments = mockAppointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return !(aptDate.getFullYear() === 2025 && aptDate.getMonth() === 4 && aptDate.getDate() === 31);
  });
  
  // 新しい5/31の予約を追加
  const may31Appointments: Appointment[] = demoCustomers.map((customer, index) => {
    const hour = 10 + index * 2; // 10:00, 12:00, 14:00, 16:00, 18:00
    const startTime = new Date(may31);
    startTime.setHours(hour, 0, 0, 0);
    
    const duration = 90; // 90分の施術
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    const menus = [
      { name: '全身脱毛コース', price: 28000 },
      { name: 'VIO脱毛', price: 15000 },
      { name: '顔脱毛', price: 12000 },
      { name: 'スペシャルケアコース', price: 35000 },
      { name: '部分脱毛', price: 15000 }
    ];
    
    const selectedMenu = menus[index % menus.length];
    
    return {
      id: `APT-DEMO-0531-${index + 1}`,
      customerId: customer.id,
      customerName: `${customer.lastName} ${customer.firstName}`,
      startTime,
      endTime,
      title: `${customer.lastName} ${customer.firstName}`,
      notes: 'デモ用予約',
      status: 'scheduled' as const,
      createdAt: new Date(2025, 4, 20), // 5月20日に作成
      updatedAt: new Date(2025, 4, 25), // 5月25日に更新
      staffName: customer.primaryStaff || staffNames[index % staffNames.length],
      menu: selectedMenu.name,
      price: selectedMenu.price,
    };
  });
  
  // 既存の予約と5/31の予約を結合して再ソート
  mockAppointments.length = 0;
  mockAppointments.push(...existingAppointments, ...may31Appointments);
  mockAppointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
})();