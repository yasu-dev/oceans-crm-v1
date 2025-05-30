interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'blue' | 'teal' | 'amber' | 'red';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar = ({ 
  value, 
  max, 
  color = 'blue',
  showText = true,
  size = 'md',
}: ProgressBarProps) => {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  
  const colorClasses = {
    blue: 'bg-blue-600',
    teal: 'bg-teal-600',
    amber: 'bg-amber-500',
    red: 'bg-red-600',
  };
  
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {showText && (
          <>
            <span className="text-sm font-medium text-gray-700">
              {value} / {max}
            </span>
            <span className="text-sm font-medium text-gray-500">
              {percentage}%
            </span>
          </>
        )}
      </div>
      <div className={`w-full bg-gray-200 rounded-full ${heightClasses[size]}`}>
        <div 
          className={`${colorClasses[color]} rounded-full ${heightClasses[size]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;