import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'blue' | 'teal' | 'amber' | 'red' | 'green';
  change?: number;
  subtitle?: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  change, 
  subtitle 
}: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    teal: 'bg-teal-50 text-teal-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    green: 'bg-green-50 text-green-700',
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-end gap-2">
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </motion.div>
  );
};

export default StatCard;