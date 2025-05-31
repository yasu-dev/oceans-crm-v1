import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Calendar, Building, Users, CreditCard, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  // モックデータ（実際のアプリケーションでは外部システムから取得）
  const profileData = {
    staffName: '木村安貴',
    staffFullName: 'キムラヤスタカ', 
    gender: '男性',
    birthDate: '1997/02/26',
    phoneNumber: '09010138782',
    email: 'oceans.kimura@gmail.com',
    hireDate: '2018/10/01',
    branch: '麻布十番店',
    referrer: '木村安貴',
    bank: 'みずほ銀行',
    branchName: '六本木支店',
    accountNumber: '1234567',
    accountName: 'キムラヤスタカ',
    invoiceNumber: 'T1234567890123',
    status: '活動中',
    team: 'Aチーム',
    role: 'スタッフ',
  };

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

  const InfoItem = ({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) => (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="text-primary-600 mt-0.5">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className="text-sm text-gray-800 font-medium">{value || '-'}</div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const isActive = status === '活動中';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    );
  };

  return (
    <motion.div
      className="page-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* プロフィールヘッダー */}
      <motion.div variants={itemVariants} className="card mb-4 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary-900 text-white rounded-full flex items-center justify-center text-xl font-bold">
            {profileData.staffName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-900">{profileData.staffName}</h1>
            <p className="text-sm text-primary-700">{profileData.staffFullName}</p>
          </div>
          <StatusBadge status={profileData.status} />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <InfoItem icon={<Building size={16} />} label="所属店舗" value={profileData.branch} />
          <InfoItem icon={<Shield size={16} />} label="役職" value={profileData.role} />
        </div>
      </motion.div>

      {/* 基本情報 */}
      <motion.div variants={itemVariants} className="card mb-4">
        <h2 className="text-lg font-medium mb-4 text-primary-900 flex items-center gap-2">
          <User size={18} />
          基本情報
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoItem label="スタッフ名" value={profileData.staffName} />
            <InfoItem label="フルネーム（カナ）" value={profileData.staffFullName} />
            <InfoItem label="性別" value={profileData.gender} />
            <InfoItem label="生年月日" value={profileData.birthDate} />
          </div>
        </div>
      </motion.div>

      {/* 連絡先情報 */}
      <motion.div variants={itemVariants} className="card mb-4">
        <h2 className="text-lg font-medium mb-4 text-primary-900 flex items-center gap-2">
          <Mail size={18} />
          連絡先情報
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoItem icon={<Phone size={14} />} label="電話番号" value={profileData.phoneNumber} />
            <InfoItem icon={<Mail size={14} />} label="メールアドレス" value={profileData.email} />
          </div>
        </div>
      </motion.div>

      {/* 勤務情報 */}
      <motion.div variants={itemVariants} className="card mb-4">
        <h2 className="text-lg font-medium mb-4 text-primary-900 flex items-center gap-2">
          <Calendar size={18} />
          勤務情報
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoItem label="入社日" value={profileData.hireDate} />
            <InfoItem label="所属店舗" value={profileData.branch} />
            <InfoItem label="チーム" value={profileData.team} />
            <InfoItem label="紹介者" value={profileData.referrer} />
          </div>
        </div>
      </motion.div>

      {/* 金融情報 */}
      <motion.div variants={itemVariants} className="card mb-4">
        <h2 className="text-lg font-medium mb-4 text-primary-900 flex items-center gap-2">
          <CreditCard size={18} />
          金融情報
        </h2>
        
        <div className="space-y-4">
          {/* 銀行情報 */}
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3">銀行口座</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <InfoItem label="銀行名" value={profileData.bank} />
              <InfoItem label="支店名" value={profileData.branchName} />
              <InfoItem label="口座番号" value={profileData.accountNumber} />
              <InfoItem label="口座名義" value={profileData.accountName} />
            </div>
          </div>
          
          {/* インボイス */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3">インボイス</h3>
            <InfoItem label="インボイス番号" value={profileData.invoiceNumber} />
          </div>
        </div>
      </motion.div>

      {/* アクションボタン */}
      {/* 
      <motion.div variants={itemVariants} className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-0">
        <div className="max-w-md mx-auto">
          <button className="w-full bg-primary-900 text-white py-3 rounded-lg font-medium hover:bg-primary-800 transition-colors shadow-lg">
            プロフィールを編集
          </button>
        </div>
      </motion.div>
      */}
      
      {/* BottomNavigationのためのスペーサー */}
      <div className="h-32"></div>
    </motion.div>
  );
};

export default Profile; 