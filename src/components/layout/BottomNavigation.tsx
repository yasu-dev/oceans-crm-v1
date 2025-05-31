import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, BarChart2, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigationItems = [
    { path: '/dashboard', label: 'ホーム', icon: Home },
    { path: '/customers', label: '顧客', icon: Users },
    { path: '/appointments', label: '予約', icon: Calendar },
    { path: '/analysis', label: '分析', icon: BarChart2 },
    { path: '/profile', label: 'ユーザー', icon: User },
  ];
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-around">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center relative ${
              isActive(item.path) ? 'text-blue-700' : 'text-gray-500'
            }`}
          >
            {isActive(item.path) && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-3 h-1 w-8 bg-blue-700 rounded-b-full"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <item.icon size={24} />
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;