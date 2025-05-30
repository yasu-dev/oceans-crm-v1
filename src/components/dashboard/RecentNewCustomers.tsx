import { useApp } from '../../contexts/AppContext';
import { UserPlus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const RecentNewCustomers = () => {
  const { customers } = useApp();
  
  // 過去30日の新規顧客を取得
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCustomers = customers
    .filter(customer => new Date(customer.createdAt) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5); // 最大5件表示
  
  if (recentCustomers.length === 0) {
    return null;
  }
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">新規顧客（過去30日）</h3>
        <span className="text-xs text-gray-400">{recentCustomers.length}名</span>
      </div>
      
      <div className="space-y-2">
        {recentCustomers.map((customer) => {
          const daysAgo = Math.floor(
            (new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          return (
            <Link 
              key={customer.id} 
              to={`/customers/${customer.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <UserPlus size={16} className="text-green-600" />
                  <div>
                    <span className="text-sm font-medium">
                      {customer.lastName} {customer.firstName}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      <span>
                        {daysAgo === 0 ? '本日' : 
                         daysAgo === 1 ? '昨日' : 
                         `${daysAgo}日前`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{customer.contract.course}</div>
                  <div className="text-xs text-gray-400">
                    担当: {customer.primaryStaff}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RecentNewCustomers; 