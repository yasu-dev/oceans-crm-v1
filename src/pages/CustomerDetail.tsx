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
  X
} from 'lucide-react';
import { useState } from 'react';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { customers, visits, appointments, addVisit } = useApp();
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitDate, setVisitDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [visitNotes, setVisitNotes] = useState('');
  
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
        
        <div className="text-sm text-gray-500 mb-4">
          ID: {customer.id}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">担当者</div>
            <div>{customer.primaryStaff}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">リスクスコア</div>
            <div className="flex items-center">
              <span className="font-medium">{riskScore}</span>
              <span className="text-xs ml-1">/100</span>
              <PriorityBadge priority={priority} size="sm" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">コース</div>
            <div>{customer.contract.course}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">契約金額</div>
            <div className="font-medium">¥{customer.contract.amount.toLocaleString()}</div>
          </div>
        </div>
      </motion.div>
      
      {/* Action buttons */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-4">
        <button className="btn btn-primary">
          <Phone size={18} />
          <span>電話する</span>
        </button>
        <button className="btn btn-secondary">
          <MessageCircle size={18} />
          <span>LINEする</span>
        </button>
      </motion.div>
      
      {/* Customer analytics */}
      <motion.div variants={itemVariants} className="card mb-4">
        <h2 className="text-lg font-medium mb-3">来店分析</h2>
        
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
          <div className="p-2 rounded-full bg-amber-50 text-amber-700">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">推奨フォロー</div>
            <div className="font-medium">{recommendation}</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-1">消化状況</div>
          <ProgressBar 
            value={10 - customer.contract.remainingVisits} 
            max={10}
            color="blue"
          />
        </div>
      </motion.div>
      
      {/* 次回予約 */}
      {futureAppointments.length > 0 && (
        <motion.div variants={itemVariants} className="card mb-4">
          <h2 className="text-lg font-medium mb-3">次回予約</h2>
          <div className="space-y-2">
            {futureAppointments.map(apt => (
              <div key={apt.id} className="p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-blue-900">
                      {format(new Date(apt.startTime), 'M月d日(E)', { locale: ja })}
                      {' '}
                      {format(new Date(apt.startTime), 'HH:mm')} - {format(new Date(apt.endTime), 'HH:mm')}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      {apt.title}
                    </div>
                    {apt.notes && (
                      <div className="text-xs text-blue-600 mt-1">
                        {apt.notes}
                      </div>
                    )}
                  </div>
                  <button className="text-blue-700 hover:text-blue-800">
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
              <div key={visit.id} className="card">
                <div className="flex gap-3">
                  <div className="p-2 bg-blue-50 text-blue-700 rounded-full h-min">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="font-medium">
                      {format(parseISO(visit.date), 'yyyy年M月d日(E)', { locale: ja })}
                    </div>
                    {visit.notes && (
                      <div className="text-sm text-gray-600 mt-1">{visit.notes}</div>
                    )}
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
    </motion.div>
  );
};

export default CustomerDetail;