import { useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import ProgressBar from '../components/ui/ProgressBar';
import { 
  calculateCustomerStatus, 
  calculateAverageInterval, 
  calculateFrequencyChange,
  calculateRiskScore,
  getFollowUpPriority,
  getRecommendedFollowUp
} from '../utils/customerAnalytics';
import { 
  Calendar, 
  Phone, 
  MessageCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Edit,
  PlusCircle,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign
} from 'lucide-react';
import { useState } from 'react';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { customers, visits, appointments, addVisit } = useApp();
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitDate, setVisitDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [visitNotes, setVisitNotes] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<typeof appointments[0] | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<typeof visits[0] | null>(null);
  
  // 折り畳み状態管理
  const [expandedSections, setExpandedSections] = useState({
    customerInfo: false,
    healthInfo: false,
    hairRemovalInfo: false,
    otherInfo: false,
  });
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const customer = customers.find(c => c.id === id);
  
  if (!customer) {
    return (
      <div className="page-container">
        <div className="text-center text-gray-500 py-8">
          顧客が見つかりません
        </div>
      </div>
    );
  }
  
  const customerVisits = visits.filter(v => v.customerId === customer.id);
  const customerAppointments = appointments.filter(a => a.customerId === customer.id);
  
  // 未来の予約を取得（予定のみ）
  const futureAppointments = customerAppointments
    .filter(apt => new Date(apt.startTime) > new Date() && apt.status === 'scheduled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  const status = calculateCustomerStatus(customer, visits);
  const avgInterval = calculateAverageInterval(customer, visits);
  const freqChange = calculateFrequencyChange(customer, visits);
  const riskScore = calculateRiskScore(customer, visits);
  const priority = getFollowUpPriority(riskScore);
  const recommendation = getRecommendedFollowUp(riskScore);
  
  // 施術金額の計算
  const customerVisitsWithAmount = customerVisits.filter(v => v.amount && v.amount > 0);
  const totalAmount = customerVisitsWithAmount.reduce((sum, v) => sum + (v.amount || 0), 0);
  const avgAmount = customerVisitsWithAmount.length > 0 ? Math.round(totalAmount / customerVisitsWithAmount.length) : 0;
  
  // Sort visits by date (newest first)
  const sortedVisits = [...customerVisits].sort((a, b) => 
    parseISO(b.date).getTime() - parseISO(a.date).getTime()
  );
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  const handleSubmitVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customer) {
      addVisit({
        id: `V-${Date.now()}`,
        customerId: customer.id,
        date: visitDate,
        notes: visitNotes,
        createdAt: new Date().toISOString()
      });
      setShowVisitForm(false);
      setVisitDate(format(new Date(), 'yyyy-MM-dd'));
      setVisitNotes('');
    }
  };
  
  return (
    <motion.div 
      className="page-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Customer header card */}
      <motion.div variants={itemVariants} className="card mb-4 relative">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-xl font-bold">
            {customer.lastName} {customer.firstName}
          </h1>
          <StatusBadge status={status} size="md" />
        </div>
      </motion.div>
      
      {/* Action buttons */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-4">
        <button className="btn btn-primary">
          <Phone size={18} />
          <span>電話する</span>
        </button>
        <button className="btn bg-[#00B900] hover:bg-[#00A000] text-white">
          <MessageCircle size={18} />
          <span>LINEする</span>
        </button>
      </motion.div>
      
      {/* New Customer Information Section */}
      <motion.div variants={itemVariants} className="card mb-4">
        <button
          onClick={() => toggleSection('customerInfo')}
          className="w-full flex justify-between items-center text-left mb-4"
        >
          <h2 className="text-lg font-medium text-gray-800">顧客情報詳細</h2>
          {expandedSections.customerInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSections.customerInfo && (
          <div className="space-y-4">
            {/* 基本情報 */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3">基本情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InfoItem label="顧客番号" value={customer.id} />
                <InfoItem label="LINE ID" value={customer.lineId} />
                <InfoItem label="氏名" value={`${customer.lastName} ${customer.firstName}`} />
                <InfoItem label="氏名 (カナ)" value={`${customer.lastNameKana} ${customer.firstNameKana}`} />
                <InfoItem label="性別" value={customer.gender === 'male' ? '男性' : customer.gender === 'female' ? '女性' : 'その他'} />
                <InfoItem label="生年月日" value={customer.birthday ? format(parseISO(customer.birthday), 'yyyy年M月d日') : '未設定'} />
              </div>
            </div>
            
            {/* 連絡先情報 */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3">連絡先</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InfoItem label="電話番号" value={customer.phone} />
                <InfoItem label="メールアドレス" value={customer.email} />
                <InfoItem label="郵便番号" value={customer.postalCode} />
                <InfoItem label="都道府県" value={customer.prefecture} />
                <InfoItem label="市区町村" value={customer.city} />
                <InfoItem label="住所" value={customer.address1} />
              </div>
            </div>
            
            {/* 職業・来店情報 */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">職業・来店情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InfoItem label="職業" value={customer.occupation} />
                <InfoItem label="職業詳細" value={customer.occupationDetail} />
                <InfoItem label="来店動機" value={customer.storeVisitReason} />
                <InfoItem label="来店動機詳細" value={customer.storeVisitReasonDetail} />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="card mb-4">
        <button
          onClick={() => toggleSection('healthInfo')}
          className="w-full flex justify-between items-center text-left mb-4"
        >
          <h2 className="text-lg font-medium text-gray-800">健康・体質情報</h2>
          {expandedSections.healthInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSections.healthInfo && (
          <div className="space-y-4">
            {/* アレルギー・体調 */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3">アレルギー・体調</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InfoItem label="体調・アレルギー" value={customer.physicalConditionAllergy} />
                <InfoItem label="詳細" value={customer.physicalConditionAllergyDetail} />
              </div>
            </div>
            
            {/* 肌・化粧品 */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3">肌・化粧品</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InfoItem label="化粧品" value={customer.cosmetics} />
                <InfoItem label="化粧品詳細" value={customer.cosmeticsDetail} />
                <InfoItem label="肌の悩み" value={customer.skinConcerns} />
                <InfoItem label="肌の悩み詳細" value={customer.skinConcernsDetail} />
              </div>
            </div>
            
            {/* 妊娠・子供 */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3">妊娠・子供</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InfoItem label="妊娠" value={customer.pregnancy} />
                <InfoItem label="妊娠詳細" value={customer.pregnancyDetail} />
                <InfoItem label="子供" value={customer.children} />
                <InfoItem label="子供詳細" value={customer.childrenDetail} />
              </div>
            </div>
            
            {/* 既往歴・薬 */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">既往歴・薬</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InfoItem label="既往歴" value={customer.medicalHistory} />
                <InfoItem label="既往歴詳細" value={customer.medicalHistoryDetail} />
                <InfoItem label="服用中の薬" value={customer.medication} />
                <InfoItem label="服用中の薬詳細" value={customer.medicationDetail} />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="card mb-4">
        <button
          onClick={() => toggleSection('hairRemovalInfo')}
          className="w-full flex justify-between items-center text-left mb-4"
        >
          <h2 className="text-lg font-medium text-gray-800">脱毛経験・希望</h2>
          {expandedSections.hairRemovalInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSections.hairRemovalInfo && (
          <div className="space-y-4">
            {/* 自己処理 */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3">自己処理</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InfoItem label="自己処理方法" value={customer.selfCareHairRemoval} />
                <InfoItem label="詳細" value={customer.selfCareHairRemovalDetail} />
              </div>
            </div>
            
            {/* 脱毛経験 */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3">脱毛経験</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InfoItem label="脱毛経験" value={customer.hairRemovalExperience} />
                <InfoItem label="経験サロン" value={customer.hairRemovalExperienceSalon} />
                <InfoItem label="詳細" value={customer.hairRemovalExperienceDetail} />
                <InfoItem label="脱毛トラブル" value={customer.hairRemovalTrouble} />
                <InfoItem label="トラブル詳細" value={customer.hairRemovalTroubleDetail} />
              </div>
            </div>
            
            {/* 理想 */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">理想</h3>
              <div className="grid grid-cols-1 gap-y-3">
                <InfoItem label="美の理想イメージ" value={customer.idealBeautyImage} />
              </div>
            </div>
          </div>
        )}
      </motion.div>
      
      <motion.div variants={itemVariants} className="card mb-4">
        <button
          onClick={() => toggleSection('otherInfo')}
          className="w-full flex justify-between items-center text-left mb-4"
        >
          <h2 className="text-lg font-medium text-gray-800">その他の情報</h2>
          {expandedSections.otherInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSections.otherInfo && (
          <div className="space-y-4">
            {/* メモ情報 */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3">メモ・コメント</h3>
              <div className="grid grid-cols-1 gap-y-3">
                <InfoItem label="コメント" value={customer.comment} />
                <InfoItem label="次回予約メモ" value={customer.nextAppointmentNote} />
                <InfoItem label="前回予約メモ" value={customer.previousAppointmentNote} />
              </div>
            </div>
            
            {/* 契約・紹介情報 */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">契約・紹介</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <InfoItem label="契約者" value={customer.contractor} />
                <InfoItem label="サブ契約者" value={customer.subContractor} />
                <InfoItem label="紹介者" value={customer.introducer} />
                <InfoItem label="サブ紹介者" value={customer.subIntroducer} />
              </div>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Customer analytics */}
      <motion.div variants={itemVariants} className="card mb-4">
        <h2 className="text-lg font-medium mb-3">来店分析</h2>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-purple-50 text-purple-700">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-sm text-gray-500">総来店回数</div>
            <div className="font-medium">{customerVisits.length}回</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-blue-50 text-blue-700">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-sm text-gray-500">平均来店間隔</div>
            <div className="font-medium">{avgInterval}日</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-teal-50 text-teal-700">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="text-sm text-gray-500">来店頻度の変化</div>
            <div className={`font-medium ${freqChange > 0 ? 'text-green-600' : freqChange < 0 ? 'text-red-600' : ''}`}>
              {freqChange > 0 ? '+' : ''}{freqChange}%
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-green-50 text-green-700">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="text-sm text-gray-500">平均施術金額</div>
            <div className="font-medium">¥{avgAmount.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-green-50 text-green-700">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="text-sm text-gray-500">累積施術金額</div>
            <div className="font-medium">¥{totalAmount.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-red-50 text-red-700">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-sm text-gray-500">リスクスコア</div>
            <div className="flex items-center">
              <span className="font-medium">{riskScore}</span>
              <span className="text-xs ml-1">/100</span>
              <PriorityBadge priority={priority} size="sm" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-amber-50 text-amber-700">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">推奨フォロー</div>
            <div className="font-medium">{recommendation}</div>
          </div>
        </div>
      </motion.div>
      
      {/* 次回予約 */}
      {futureAppointments.length > 0 && (
        <motion.div variants={itemVariants} className="card mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">次回予約</h2>
            <div className="text-sm text-gray-500">
              来店回数: {customerVisits.length}回
            </div>
          </div>
          <div className="space-y-2">
            {futureAppointments.map(apt => (
              <div 
                key={apt.id} 
                className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => setSelectedAppointment(apt)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-blue-900">
                      {format(new Date(apt.startTime), 'M月d日(E)', { locale: ja })}
                      {' '}
                      {format(new Date(apt.startTime), 'HH:mm')} - {format(new Date(apt.endTime), 'HH:mm')}
                    </div>
                    {apt.notes && (
                      <div className="text-xs text-blue-600 mt-1">
                        {apt.notes}
                      </div>
                    )}
                  </div>
                  <button 
                    className="text-blue-700 hover:text-blue-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle edit action
                    }}
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Visit history */}
      <motion.div variants={itemVariants} className="mb-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">来店履歴</h2>
          <button 
            onClick={() => setShowVisitForm(true)}
            className="text-blue-700 flex items-center gap-1 text-sm"
          >
            <PlusCircle size={16} />
            <span>来店登録</span>
          </button>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        {sortedVisits.length > 0 ? (
          <div className="space-y-3">
            {sortedVisits.map(visit => (
              <div 
                key={visit.id} 
                className="card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedVisit(visit)}
              >
                <div className="flex gap-3">
                  <div className="p-2 bg-blue-50 text-blue-700 rounded-full h-min">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {format(parseISO(visit.date), 'yyyy年M月d日(E)', { locale: ja })}
                        </div>
                        {visit.notes && (
                          <div className="text-sm text-gray-600 mt-1">{visit.notes}</div>
                        )}
                      </div>
                      {visit.amount && (
                        <div className="text-sm font-medium text-gray-700">
                          ¥{visit.amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            来店履歴がありません
          </div>
        )}
      </motion.div>
      
      {/* 来店登録フォームモーダル */}
      {showVisitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">来店登録</h3>
              <button
                onClick={() => setShowVisitForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitVisit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  来店日
                </label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メモ（任意）
                </label>
                <textarea
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="施術内容やお客様の様子など"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowVisitForm(false)}
                  className="btn btn-secondary flex-1"
                >
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  登録
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* 予約詳細モーダル */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-lg p-6 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">予約詳細</h3>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">予約日時</div>
                <div className="font-medium">
                  {format(new Date(selectedAppointment.startTime), 'yyyy年M月d日(E)', { locale: ja })}
                </div>
                <div className="text-sm text-gray-600">
                  {format(new Date(selectedAppointment.startTime), 'HH:mm')} - 
                  {format(new Date(selectedAppointment.endTime), 'HH:mm')}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">担当スタッフ</div>
                <div className="text-sm">{selectedAppointment.staffName || '未設定'}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">メニュー</div>
                <div className="text-sm">{selectedAppointment.menu || '未設定'}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">料金</div>
                <div className="text-sm">¥{selectedAppointment.price?.toLocaleString() || '0'}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">メモ</div>
                <div className="text-sm">{selectedAppointment.notes || 'なし'}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">ステータス</div>
                <div className="text-sm">
                  {selectedAppointment.status === 'scheduled' ? '予約確定' : 
                   selectedAppointment.status === 'cancelled' ? 'キャンセル' : 
                   selectedAppointment.status === 'completed' ? '完了' : '不明'}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="btn btn-secondary"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* 来店履歴詳細モーダル */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-lg p-6 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">来店履歴詳細</h3>
              <button 
                onClick={() => setSelectedVisit(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">来店日</div>
                <div className="font-medium">
                  {format(parseISO(selectedVisit.date), 'yyyy年M月d日(E)', { locale: ja })}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">担当スタッフ</div>
                <div className="text-sm">{selectedVisit.staffName || customer.primaryStaff || '未設定'}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">施術内容</div>
                <div className="text-sm">{selectedVisit.treatmentContent || '未設定'}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">来店時間</div>
                <div className="text-sm">{selectedVisit.visitTime || '未設定'}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">退店時間</div>
                <div className="text-sm">{selectedVisit.leaveTime || '未設定'}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">金額</div>
                <div className="text-sm">¥{selectedVisit.amount?.toLocaleString() || '0'}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">支払方法</div>
                <div className="text-sm">{selectedVisit.paymentMethod || '未設定'}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">メモ</div>
                <div className="text-sm">{selectedVisit.notes || 'なし'}</div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedVisit(null)}
                className="btn btn-secondary"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

// Helper component for displaying info items
const InfoItem = ({ label, value }: { label: string; value?: string | number }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <div className="text-xs text-gray-500 mb-1 font-medium">{label}</div>
    <div className="text-sm text-gray-800">{value || <span className="text-gray-400">未設定</span>}</div>
  </div>
);

export default CustomerDetail;