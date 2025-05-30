import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown } from 'lucide-react';

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
    bank: '',
    zodiac: '',
    invoiceNumber: 'oceanscrm@gmail.com',
    status: '活動中',
    team: 'チームを選択',
    password: '••••••••',
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-sm font-medium text-gray-600 mb-4">{title}</h3>
  );

  const FormField = ({ 
    label, 
    value, 
    isDropdown = false,
    required = false 
  }: { 
    label: string; 
    value: string; 
    isDropdown?: boolean;
    required?: boolean;
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          readOnly
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
        />
        {isDropdown && (
          <ChevronDown 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" 
            size={20} 
          />
        )}
      </div>
    </div>
  );

  const RadioField = ({ label, value, required = false }: { label: string; value: string; required?: boolean }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex gap-8">
        <label className="flex items-center">
          <input
            type="radio"
            checked={value === '男性'}
            readOnly
            className="mr-2"
            disabled
          />
          <span className="text-gray-700">男性</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            checked={value === '女性'}
            readOnly
            className="mr-2"
            disabled
          />
          <span className="text-gray-700">女性</span>
        </label>
      </div>
    </div>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-md mx-auto px-4 py-6 pb-20"
    >
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <FormField label="スタッフ名" value={profileData.staffName} required />
            <FormField label="スタッフフルネーム" value={profileData.staffFullName} required />
            <RadioField label="性別" value={profileData.gender} required />
            <FormField label="生年月日" value={profileData.birthDate} required />
            <FormField label="電話番号" value={profileData.phoneNumber} required />
            <FormField label="メール" value={profileData.email} required />
            <FormField label="入社日" value={profileData.hireDate} required />
            <FormField label="所属店舗" value={profileData.branch} isDropdown required />
            <FormField label="紹介者" value={profileData.referrer} isDropdown required />
            <FormField label="銀行名" value={profileData.bank} />
            <FormField label="口座番号" value={profileData.zodiac} />
            <FormField label="口座名義" value={profileData.zodiac} />
            <FormField label="インボイス番号" value={profileData.invoiceNumber} />
            <FormField label="ステータス" value={profileData.status} isDropdown />
            <FormField label="チーム" value={profileData.team} isDropdown />
            <FormField label="パスワード" value={profileData.password} required />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile; 