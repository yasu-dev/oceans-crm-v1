import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { motion } from 'framer-motion';
import CustomerCard from '../components/customer/CustomerCard';
import { Customer } from '../types/customer';
import { calculateCustomerStatus, hasVisitedInMonth, hasFutureReservation } from '../utils/customerAnalytics';
import { Filter, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

type FilterTab = 
  | 'all'
  | 'last-month-visited'       // 先月来店(今月未来店)
  | 'two-months-no-visit'      // 先々月来店(2ヶ月未来店)
  | 'repeating-with-reservation'  // リピート中(予約あり)
  | 'repeating-no-reservation'    // リピート中(予約なし)
  | 'three-months-no-visit'    // 3ヶ月以上未来店
  | 'graduated';               // 卒業

const CustomerList = () => {
  const { customers, visits } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get search query from URL if it exists
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  // Apply filters and search
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Apply search filter first
      if (searchQuery) {
        const fullName = `${customer.lastName}${customer.firstName}`;
        const fullNameKana = `${customer.lastNameKana}${customer.firstNameKana}`;
        if (!fullName.includes(searchQuery) && !fullNameKana.includes(searchQuery)) {
          return false;
        }
      }
      
      // Apply tab filter
      const status = calculateCustomerStatus(customer, visits);
      
      switch (activeTab) {
        case 'all':
          return true;
          
        case 'last-month-visited':
          return status === 'last-month-visited';
          
        case 'two-months-no-visit':
          return status === 'two-months-no-visit';
          
        case 'repeating-with-reservation':
          return status === 'repeating-with-reservation';
          
        case 'repeating-no-reservation':
          return status === 'repeating-no-reservation';
          
        case 'three-months-no-visit':
          return status === 'three-months-no-visit';
          
        case 'graduated':
          return status === 'graduated';
          
        default:
          return true;
      }
    });
  }, [customers, visits, activeTab, searchQuery]);
  
  // Tab configuration
  const tabs: { key: FilterTab; label: string; color: string }[] = [
    { key: 'all', label: 'すべて', color: 'gray' },
    { key: 'last-month-visited', label: '先月来店(今月未来店)', color: 'yellow' },
    { key: 'two-months-no-visit', label: '先々月来店(2ヶ月未来店)', color: 'orange' },
    { key: 'repeating-with-reservation', label: 'リピート中(予約あり)', color: 'green' },
    { key: 'repeating-no-reservation', label: 'リピート中(予約なし)', color: 'amber' },
    { key: 'three-months-no-visit', label: '3ヶ月以上未来店', color: 'red' },
    { key: 'graduated', label: '卒業', color: 'gray' },
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.05,
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/customers?search=${encodeURIComponent(localSearch)}`);
  };
  
  return (
    <div className="page-container">
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="顧客名を検索..."
            className="input flex-1"
          />
          <button 
            type="submit" 
            className="btn btn-primary"
          >
            検索
          </button>
        </form>
        
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key 
                  ? tab.color === 'gray' 
                    ? 'bg-gray-800 text-white' 
                    : `bg-${tab.color}-600 text-white`
                  : tab.color === 'gray'
                    ? 'bg-gray-100 text-gray-700'
                    : `bg-${tab.color}-50 text-${tab.color}-700`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-sm font-medium text-gray-500">
          {filteredCustomers.length}件の顧客
        </h2>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredCustomers.map(customer => (
          <motion.div key={customer.id} variants={itemVariants}>
            <CustomerCard customer={customer} visits={visits} />
          </motion.div>
        ))}
        
        {filteredCustomers.length === 0 && (
          <motion.div 
            variants={itemVariants} 
            className="text-center text-gray-500 py-8"
          >
            該当する顧客がいません
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CustomerList;