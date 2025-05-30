import { useApp } from '../../contexts/AppContext';
import { calculateCustomerStatus } from '../../utils/customerAnalytics';
import { motion } from 'framer-motion';

const StatusDistribution = () => {
  const { customers, visits } = useApp();
  
  // Calculate status counts
  const statusCounts = {
    'last-month-visited': 0,
    'two-months-no-visit': 0,
    'repeating-with-reservation': 0,
    'repeating-no-reservation': 0,
    'three-months-no-visit': 0,
    'graduated': 0
  };
  
  customers.forEach(customer => {
    const status = calculateCustomerStatus(customer, visits);
    statusCounts[status]++;
  });
  
  const total = customers.length;
  
  // Calculate percentages
  const percentages = {
    'last-month-visited': Math.round((statusCounts['last-month-visited'] / total) * 100) || 0,
    'two-months-no-visit': Math.round((statusCounts['two-months-no-visit'] / total) * 100) || 0,
    'repeating-with-reservation': Math.round((statusCounts['repeating-with-reservation'] / total) * 100) || 0,
    'repeating-no-reservation': Math.round((statusCounts['repeating-no-reservation'] / total) * 100) || 0,
    'three-months-no-visit': Math.round((statusCounts['three-months-no-visit'] / total) * 100) || 0,
    'graduated': Math.round((statusCounts['graduated'] / total) * 100) || 0,
  };
  
  const barWidth = {
    'repeating-with-reservation': `${percentages['repeating-with-reservation']}%`,
    'repeating-no-reservation': `${percentages['repeating-no-reservation']}%`,
    'last-month-visited': `${percentages['last-month-visited']}%`,
    'two-months-no-visit': `${percentages['two-months-no-visit']}%`,
    'three-months-no-visit': `${percentages['three-months-no-visit']}%`,
    'graduated': `${percentages['graduated']}%`,
  };
  
  return (
    <div className="card">
      <h3 className="text-sm font-medium text-gray-500 mb-2">顧客ステータス分布</h3>
      
      <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden flex">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: barWidth['repeating-with-reservation'] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-green-600" 
          style={{ width: barWidth['repeating-with-reservation'] }}
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: barWidth['repeating-no-reservation'] }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="h-full bg-amber-500" 
          style={{ width: barWidth['repeating-no-reservation'] }}
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: barWidth['last-month-visited'] }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="h-full bg-yellow-500" 
          style={{ width: barWidth['last-month-visited'] }}
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: barWidth['two-months-no-visit'] }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="h-full bg-orange-500" 
          style={{ width: barWidth['two-months-no-visit'] }}
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: barWidth['three-months-no-visit'] }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="h-full bg-red-500" 
          style={{ width: barWidth['three-months-no-visit'] }}
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: barWidth['graduated'] }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          className="h-full bg-gray-500" 
          style={{ width: barWidth['graduated'] }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span>リピート中(予約あり)</span>
          <span className="text-gray-500 ml-auto">{statusCounts['repeating-with-reservation']}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>リピート中(予約なし)</span>
          <span className="text-gray-500 ml-auto">{statusCounts['repeating-no-reservation']}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>先月来店(今月未来店)</span>
          <span className="text-gray-500 ml-auto">{statusCounts['last-month-visited']}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>先々月来店(2ヶ月未来店)</span>
          <span className="text-gray-500 ml-auto">{statusCounts['two-months-no-visit']}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>3ヶ月以上未来店</span>
          <span className="text-gray-500 ml-auto">{statusCounts['three-months-no-visit']}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span>卒業</span>
          <span className="text-gray-500 ml-auto">{statusCounts['graduated']}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusDistribution;