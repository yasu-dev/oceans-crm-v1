import { useApp } from '../../contexts/AppContext';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const TodayAppointments = () => {
  const { appointments, customers } = useApp();
  
  // 本日の予約を取得
  const today = new Date();
  const todayAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === today.toDateString() && 
             apt.status === 'scheduled';
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5); // 最大5件表示
  
  if (todayAppointments.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500 mb-2">本日の予約</h3>
        <p className="text-sm text-gray-400">本日の予約はありません</p>
      </div>
    );
  }
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">本日の予約</h3>
        <span className="text-xs text-gray-400">{todayAppointments.length}件</span>
      </div>
      
      <div className="space-y-2">
        {todayAppointments.map((appointment) => {
          const customer = customers.find(c => c.id === appointment.customerId);
          const time = format(new Date(appointment.startTime), 'HH:mm', { locale: ja });
          
          return (
            <Link 
              key={appointment.id} 
              to={`/customers/${appointment.customerId}`}
              className="block"
            >
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock size={14} />
                    <span className="text-sm font-medium">{time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} className="text-gray-400" />
                    <span className="text-sm">
                      {customer ? `${customer.lastName} ${customer.firstName}` : appointment.customerName}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{appointment.title}</span>
              </div>
            </Link>
          );
        })}
      </div>
      
      {appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate.toDateString() === today.toDateString() && apt.status === 'scheduled';
      }).length > 5 && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          他 {appointments.filter(apt => {
            const aptDate = new Date(apt.startTime);
            return aptDate.toDateString() === today.toDateString() && apt.status === 'scheduled';
          }).length - 5}件
        </p>
      )}
    </div>
  );
};

export default TodayAppointments; 