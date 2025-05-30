import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const getPageTitle = () => {
    const path = location.pathname;
    switch (true) {
      case path.includes('/dashboard'):
        return 'ダッシュボード';
      case path.includes('/customers') && !path.includes('/:id'):
        return '顧客一覧';
      case path.includes('/follow-up'):
        return 'フォロー管理';
      case path.includes('/analysis'):
        return '分析';
      case path.includes('/profile'):
        return 'プロフィール';
      case path.includes('/customers/'):
        return '顧客詳細';
      case path.includes('/appointments'):
        return '予約カレンダー';
      default:
        return '脱毛サロン顧客管理';
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const shouldShowBackButton = () => {
    return location.pathname.includes('/customers/');
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center">
          {shouldShowBackButton() ? (
            <button 
              onClick={handleBack}
              className="mr-2 p-1 rounded-full hover:bg-gray-100"
              aria-label="戻る"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-8"></div>
          )}
          <h1 className="font-medium text-lg">{getPageTitle()}</h1>
        </div>
        
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="ログアウト"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;