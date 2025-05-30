import { motion } from 'framer-motion';
import { AlertTriangle, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const ImportantSegments = () => {
  const { importantSegments } = useApp();
  
  const segments = [
    {
      id: 'twoMonthsNoVisit',
      title: '2ヶ月未来店',
      description: '先々月来店→先月・今月未来店',
      count: importantSegments.twoMonthsNoVisit.length,
      color: 'red',
      icon: <AlertTriangle size={20} />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
    },
    {
      id: 'lastMonthNoFollow',
      title: '先月来店・フォロー必要',
      description: '先月来店→今月未来店・予約なし',
      count: importantSegments.lastMonthNoFollow.length,
      color: 'amber',
      icon: <Calendar size={20} />,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    },
    {
      id: 'repeatingNoReservation',
      title: 'リピート中・予約なし',
      description: 'リピート中だが次回予約なし',
      count: importantSegments.repeatingNoReservation.length,
      color: 'blue',
      icon: <Users size={20} />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
    },
  ];
  
  const totalAlertCount = segments.reduce((sum, segment) => sum + segment.count, 0);
  
  if (totalAlertCount === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <h3 className="text-sm font-medium text-gray-500 mb-2">要注意セグメント</h3>
      
      <div className="space-y-2">
        {segments.map((segment) => {
          if (segment.count === 0) return null;
          
          return (
            <Link
              key={segment.id}
              to={`/analysis?segment=${segment.id}`}
              className={`block card border ${segment.borderColor} ${segment.bgColor} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${segment.bgColor} ${segment.textColor}`}>
                    {segment.icon}
                  </div>
                  <div>
                    <h4 className={`font-medium ${segment.textColor}`}>
                      {segment.title}
                      <span className="ml-2 text-lg font-bold">{segment.count}名</span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-0.5">{segment.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ImportantSegments; 