import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, Bell } from 'lucide-react';

import ImportantSegments from '../components/dashboard/ImportantSegments';
import TodayAppointments from '../components/dashboard/TodayAppointments';

const Dashboard = () => {
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
  
  // お知らせのサンプルデータ（本来は他のCRM管理アプリから取得）
  const announcements = [
    {
      id: 1,
      message: "本日の営業時間は19時までとなります。",
      createdAt: new Date().toISOString(),
      isImportant: true,
    },
    {
      id: 2,
      message: "月末の報告書提出をお忘れなく。",
      createdAt: new Date().toISOString(),
      isImportant: false,
    }
  ];
  
  return (
    <motion.div 
      className="page-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Date display - 改善版 */}
      <motion.div variants={itemVariants} className="card mb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Calendar className="text-blue-600" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {format(new Date(), 'M月d日', { locale: ja })}
              <span className="text-lg ml-2 text-blue-600">
                ({format(new Date(), 'E', { locale: ja })})
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {format(new Date(), 'yyyy年', { locale: ja })}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* お知らせ欄 */}
      <motion.div variants={itemVariants} className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={18} className="text-amber-600" />
          <h2 className="font-medium">お知らせ</h2>
        </div>
        <div className="space-y-2">
          {announcements.length > 0 ? (
            announcements.map(announcement => (
              <div 
                key={announcement.id} 
                className={`p-3 rounded-lg text-sm ${
                  announcement.isImportant 
                    ? 'bg-amber-50 border border-amber-200' 
                    : 'bg-gray-50'
                }`}
              >
                <p className={announcement.isImportant ? 'text-amber-800' : 'text-gray-700'}>
                  {announcement.message}
                </p>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 text-center py-2">
              お知らせはありません
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Today's appointments */}
      <motion.div variants={itemVariants} className="mb-4">
        <TodayAppointments />
      </motion.div>
      
      {/* Important segments alerts */}
      <ImportantSegments />
    </motion.div>
  );
};

export default Dashboard;