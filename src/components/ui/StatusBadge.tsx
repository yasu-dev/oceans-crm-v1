import { CustomerStatus } from '../../types/customer';

interface StatusBadgeProps {
  status: CustomerStatus;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 font-medium';
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  const statusClasses = {
    'last-month-visited': 'bg-yellow-50 text-yellow-700',
    'two-months-no-visit': 'bg-orange-50 text-orange-700',
    'repeating-with-reservation': 'bg-green-50 text-green-700',
    'repeating-no-reservation': 'bg-amber-50 text-amber-700',
    'three-months-no-visit': 'bg-red-50 text-red-700',
    'graduated': 'bg-gray-50 text-gray-700',
  };
  
  const statusLabels = {
    'last-month-visited': '先月来店(今月未来店)',
    'two-months-no-visit': '先々月来店(2ヶ月未来店)',
    'repeating-with-reservation': 'リピート中(予約あり)',
    'repeating-no-reservation': 'リピート中(予約なし)',
    'three-months-no-visit': '3ヶ月以上未来店',
    'graduated': '卒業',
  };
  
  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${statusClasses[status]}`}>
      {statusLabels[status]}
    </span>
  );
};

export default StatusBadge;