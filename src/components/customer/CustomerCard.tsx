import { Link } from 'react-router-dom';
import { Calendar, Phone, MessageCircle, CalendarPlus } from 'lucide-react';
import { Customer } from '../../types/customer';
import { Visit } from '../../types/visit';
import StatusBadge from '../ui/StatusBadge';
import { differenceInDays, parseISO } from 'date-fns';
import { calculateCustomerStatus } from '../../utils/customerAnalytics';
import { useNavigate } from 'react-router-dom';

interface CustomerCardProps {
  customer: Customer;
  visits: Visit[];
}

const CustomerCard = ({ customer, visits }: CustomerCardProps) => {
  const navigate = useNavigate();
  const status = calculateCustomerStatus(customer, visits);
  
  // Find last visit date
  const customerVisits = visits.filter(visit => visit.customerId === customer.id);
  let lastVisitDate = 'データなし';
  let daysSinceLastVisit = 0;
  
  if (customerVisits.length > 0) {
    const sortedVisits = [...customerVisits].sort((a, b) => 
      parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );
    
    const lastVisit = parseISO(sortedVisits[0].date);
    daysSinceLastVisit = differenceInDays(new Date(), lastVisit);
    
    if (daysSinceLastVisit === 0) {
      lastVisitDate = '今日';
    } else if (daysSinceLastVisit === 1) {
      lastVisitDate = '昨日';
    } else {
      lastVisitDate = `${daysSinceLastVisit}日前`;
    }
  }
  
  return (
    <Link to={`/customers/${customer.id}`} className="block">
      <div className="card mb-3 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium">{customer.lastName} {customer.firstName}</h3>
          <StatusBadge status={status} />
        </div>
        
        <div className="flex justify-between text-sm mb-2">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar size={16} />
            <span>最終来店: {lastVisitDate}</span>
          </div>
          <div className="font-medium">
            ¥{customer.contract.amount.toLocaleString()}
          </div>
        </div>
        
        <div className="flex gap-2 mt-3 justify-end">
          <button 
            className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all"
            aria-label="新規予約作成"
            onClick={(e) => {
              e.preventDefault();
              navigate('/appointments/new', { state: { selectedCustomerId: customer.id } });
            }}
          >
            <CalendarPlus size={18} />
          </button>
          <button 
            className="p-2 rounded-full bg-[#00B900] text-white hover:bg-[#00A000] transition-colors"
            aria-label="LINE"
            onClick={(e) => {
              e.preventDefault();
              // Handle LINE action
            }}
          >
            <MessageCircle size={18} />
          </button>
          <button 
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            aria-label="電話"
            onClick={(e) => {
              e.preventDefault();
              // Handle phone action
            }}
          >
            <Phone size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CustomerCard;