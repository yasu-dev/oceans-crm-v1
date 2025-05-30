type Priority = 'high' | 'medium' | 'low';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
}

const PriorityBadge = ({ priority, size = 'md' }: PriorityBadgeProps) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 font-medium';
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  const priorityClasses = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-blue-100 text-blue-800',
  };
  
  const priorityLabels = {
    high: '高',
    medium: '中',
    low: '低',
  };
  
  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${priorityClasses[priority]}`}>
      {priorityLabels[priority]}
    </span>
  );
};

export default PriorityBadge;