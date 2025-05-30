import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { motion } from 'framer-motion';
import { Users, Calendar, AlertTriangle, UserPlus, Clock } from 'lucide-react';

import StatCard from '../components/dashboard/StatCard';
import StatusDistribution from '../components/dashboard/StatusDistribution';
import ImportantSegments from '../components/dashboard/ImportantSegments';
import TodayAppointments from '../components/dashboard/TodayAppointments';
import RecentNewCustomers from '../components/dashboard/RecentNewCustomers';

const Dashboard = () => {
  const { 
    todayVisitCount, 
    todayVisitTarget, 
    followUpCount, 
    followUpCompleted,
    customers,
    appointments,
    visits,
  } = useApp();
  
  // 最近の新規顧客数を計算（過去30日）
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentNewCustomers = customers.filter(customer => 
    new Date(customer.createdAt) >= thirtyDaysAgo
  ).length;
  
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
  
  return (
    <motion.div 
      className="page-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Date display */}
      <div className="text-sm text-gray-500 mb-2">
        {new Date().toLocaleDateString('ja-JP', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        })}
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard 
          title="本日の予約"
          value={`${todayVisitCount}件`}
          icon={<Calendar size={20} />}
          color="blue"
          subtitle={`目標: ${todayVisitTarget}件`}
        />
        <StatCard 
          title="要フォロー"
          value={followUpCount}
          icon={<AlertTriangle size={20} />}
          color="amber"
          subtitle={`${followUpCompleted}件完了`}
        />
        <StatCard 
          title="新規顧客（30日）"
          value={recentNewCustomers}
          icon={<UserPlus size={20} />}
          color="green"
        />
        <StatCard 
          title="総顧客数"
          value={customers.length}
          icon={<Users size={20} />}
          color="teal"
        />
      </div>
      
      {/* Today's appointments */}
      <motion.div variants={itemVariants} className="mb-4">
        <TodayAppointments />
      </motion.div>
      
      {/* Important segments alerts */}
      <ImportantSegments />
      
      {/* Customer status distribution */}
      <motion.div variants={itemVariants} className="mb-4">
        <StatusDistribution />
      </motion.div>
      
      {/* Recent new customers */}
      <motion.div variants={itemVariants}>
        <RecentNewCustomers />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;