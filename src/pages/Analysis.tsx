import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { calculateCustomerStatus, hasVisitedInMonth, hasFutureReservation, calculateLossAmount } from '../utils/customerAnalytics';
import { TrendingUp, TrendingDown, Calendar, Users, UserCheck, UserX, DollarSign } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, addDays } from 'date-fns';
import { Customer } from '../types/customer';
import { Visit } from '../types/visit';

type DateRange = '1month' | '2months' | '3months' | '6months' | '12months' | 'custom';

const Analysis = () => {
  const { customers, visits } = useApp();
  const [dateRange, setDateRange] = useState<DateRange>('1month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Get the effective date range
  const getEffectiveDateRange = () => {
    const today = new Date();
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return {
        start: new Date(customStartDate),
        end: new Date(customEndDate),
        months: Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
      };
    }
    
    const months = dateRange === '1month' ? 1 : 
                  dateRange === '2months' ? 2 :
                  dateRange === '3months' ? 3 : 
                  dateRange === '6months' ? 6 : 12;
    
    return {
      start: subMonths(today, months - 1),
      end: today,
      months
    };
  };
  
  // ヘルパー関数：特定の日付時点での顧客ステータスを計算
  const calculateCustomerStatusAtDate = (customer: Customer, visitsUntilDate: Visit[], targetDate: Date) => {
    const thisMonth = targetDate;
    const lastMonth = subMonths(targetDate, 1);
    const twoMonthsAgo = subMonths(targetDate, 2);
    
    // 契約終了（残回数0）の場合は卒業
    if (customer.contract.remainingVisits === 0) {
      return 'graduated';
    }
    
    const customerVisits = visitsUntilDate.filter(visit => visit.customerId === customer.id);
    
    if (customerVisits.length === 0) {
      return 'three-months-no-visit';
    }
    
    // Sort visits by date, newest first
    const sortedVisits = [...customerVisits].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const lastVisitDate = new Date(sortedVisits[0].date);
    const monthsSinceLastVisit = Math.floor((targetDate.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    // 各月の来店チェック
    const visitedThisMonth = customerVisits.some(visit => {
      const visitDate = new Date(visit.date);
      return visitDate >= startOfMonth(thisMonth) && visitDate <= endOfMonth(thisMonth);
    });
    
    const visitedLastMonth = customerVisits.some(visit => {
      const visitDate = new Date(visit.date);
      return visitDate >= startOfMonth(lastMonth) && visitDate <= endOfMonth(lastMonth);
    });
    
    const visitedTwoMonthsAgo = customerVisits.some(visit => {
      const visitDate = new Date(visit.date);
      return visitDate >= startOfMonth(twoMonthsAgo) && visitDate <= endOfMonth(twoMonthsAgo);
    });
    
    const hasFutureRes = customerVisits.some(visit => {
      const visitDate = new Date(visit.date);
      return visitDate > targetDate;
    });
    
    // 3ヶ月以上未来店
    if (monthsSinceLastVisit >= 3) {
      return 'three-months-no-visit';
    }
    
    // 先々月来店(2ヶ月未来店)
    if (visitedTwoMonthsAgo && !visitedLastMonth && !visitedThisMonth) {
      return 'two-months-no-visit';
    }
    
    // 先月来店(今月未来店)
    if (visitedLastMonth && !visitedThisMonth && !hasFutureRes) {
      return 'last-month-visited';
    }
    
    // リピート中
    if (monthsSinceLastVisit < 3) {
      if (hasFutureRes) {
        return 'repeating-with-reservation';
      } else {
        return 'repeating-no-reservation';
      }
    }
    
    return 'three-months-no-visit';
  };
  
  // Calculate statistics for each month
  const monthlyStats = useMemo(() => {
    const { months } = getEffectiveDateRange();
    const stats = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const targetMonth = subMonths(new Date(), i);
      const monthStart = startOfMonth(targetMonth);
      const monthEnd = endOfMonth(targetMonth);
      
      // Count customers by status at the end of each month
      let lastMonthVisited = 0;
      let twoMonthsNoVisit = 0;
      let repeatingWithReservation = 0;
      let repeatingNoReservation = 0;
      let threeMonthsNoVisit = 0;
      let graduated = 0;
      let totalActive = 0;
      let totalRevenue = 0;
      let lossAmount = 0;
      
      // 各顧客について、その月時点でのステータスを評価
      customers.forEach(customer => {
        // 顧客の作成日が対象月より後の場合はスキップ
        if (new Date(customer.createdAt) > monthEnd) {
          return;
        }
        
        // その月時点での来店履歴をフィルタリング
        const visitsUntilMonth = visits.filter(visit => 
          new Date(visit.date) <= monthEnd
        );
        
        // その月時点でのステータスを計算
        const statusAtMonth = calculateCustomerStatusAtDate(customer, visitsUntilMonth, monthEnd);
        
        // Count by status
        switch (statusAtMonth) {
          case 'last-month-visited':
            lastMonthVisited++;
            totalActive++;
            break;
          case 'two-months-no-visit':
            twoMonthsNoVisit++;
            totalActive++;
            break;
          case 'repeating-with-reservation':
            repeatingWithReservation++;
            totalActive++;
            break;
          case 'repeating-no-reservation':
            repeatingNoReservation++;
            totalActive++;
            break;
          case 'three-months-no-visit':
            threeMonthsNoVisit++;
            // 失客による損失額を計算
            const avgVisitValue = customer.contract.amount / 12; // 月額換算
            lossAmount += avgVisitValue;
            break;
          case 'graduated':
            graduated++;
            break;
        }
        
        // Calculate revenue for active customers
        if (statusAtMonth !== 'three-months-no-visit' && statusAtMonth !== 'graduated') {
          const monthlyRevenue = customer.contract.amount / 12;
          totalRevenue += monthlyRevenue;
        }
      });
      
      stats.push({
        month: format(targetMonth, 'yyyy年MM月'),
        activeTotal: totalActive,
        lastMonthVisited,
        twoMonthsNoVisit,
        repeatingWithReservation,
        repeatingNoReservation,
        threeMonthsNoVisit,
        graduated,
        totalRevenue: Math.round(totalRevenue),
        lossAmount: Math.round(lossAmount),
      });
    }
    
    return stats;
  }, [customers, visits, dateRange, customStartDate, customEndDate]);
  
  // Current month statistics
  const currentStats = useMemo(() => {
    let stats = {
      total: customers.length,
      lastMonthVisited: 0,
      twoMonthsNoVisit: 0,
      repeatingWithReservation: 0,
      repeatingNoReservation: 0,
      threeMonthsNoVisit: 0,
      graduated: 0,
      totalRevenue: 0,
      totalLossAmount: 0,
    };
    
    customers.forEach(customer => {
      const status = calculateCustomerStatus(customer, visits);
      
      // Basic status counting
      switch (status) {
        case 'last-month-visited':
          stats.lastMonthVisited++;
          break;
        case 'two-months-no-visit':
          stats.twoMonthsNoVisit++;
          break;
        case 'repeating-with-reservation':
          stats.repeatingWithReservation++;
          break;
        case 'repeating-no-reservation':
          stats.repeatingNoReservation++;
          break;
        case 'three-months-no-visit':
          stats.threeMonthsNoVisit++;
          stats.totalLossAmount += calculateLossAmount(customer, visits);
          break;
        case 'graduated':
          stats.graduated++;
          break;
      }
      
      // Calculate revenue for active customers
      if (status !== 'three-months-no-visit' && status !== 'graduated') {
        // 月額換算の売上（仮に年間契約として計算）
        const monthlyRevenue = customer.contract.amount / 12;
        stats.totalRevenue += monthlyRevenue;
      }
    });
    
    return stats;
  }, [customers, visits]);
  
  // Pie chart data
  const pieData = [
    { name: '先月来店(今月未来店)', value: currentStats.lastMonthVisited, color: '#eab308' },
    { name: '先々月来店(2ヶ月未来店)', value: currentStats.twoMonthsNoVisit, color: '#f97316' },
    { name: 'リピート中(予約あり)', value: currentStats.repeatingWithReservation, color: '#10b981' },
    { name: 'リピート中(予約なし)', value: currentStats.repeatingNoReservation, color: '#f59e0b' },
    { name: '3ヶ月以上未来店', value: currentStats.threeMonthsNoVisit, color: '#ef4444' },
    { name: '卒業', value: currentStats.graduated, color: '#6b7280' },
  ];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  return (
    <div className="page-container">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <h2 className="text-xl font-bold mb-3">顧客分析</h2>
          
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setDateRange('1month')}
              className={`px-3 py-1 rounded-md text-sm ${
                dateRange === '1month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              1ヶ月
            </button>
            <button
              onClick={() => setDateRange('2months')}
              className={`px-3 py-1 rounded-md text-sm ${
                dateRange === '2months' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              2ヶ月
            </button>
            <button
              onClick={() => setDateRange('3months')}
              className={`px-3 py-1 rounded-md text-sm ${
                dateRange === '3months' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              3ヶ月
            </button>
            <button
              onClick={() => setDateRange('6months')}
              className={`px-3 py-1 rounded-md text-sm ${
                dateRange === '6months' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              6ヶ月
            </button>
            <button
              onClick={() => setDateRange('12months')}
              className={`px-3 py-1 rounded-md text-sm ${
                dateRange === '12months' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              12ヶ月
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-3 py-1 rounded-md text-sm ${
                dateRange === 'custom' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              任意期間
            </button>
          </div>
          
          {dateRange === 'custom' && (
            <div className="flex gap-2 items-center mb-4">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="input text-sm"
              />
              <span>〜</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="input text-sm"
              />
            </div>
          )}
        </motion.div>
        
        {/* Summary Information */}
        <motion.div variants={itemVariants} className="card mb-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-3 text-blue-800">サマリー</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-blue-600">アクティブ顧客数</div>
              <div className="text-2xl font-bold text-blue-800">
                {currentStats.total - currentStats.threeMonthsNoVisit - currentStats.graduated}名
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600">月間売上見込み</div>
              <div className="text-2xl font-bold text-blue-800">
                ¥{currentStats.totalRevenue.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600">失客リスク顧客</div>
              <div className="text-2xl font-bold text-orange-800">
                {currentStats.lastMonthVisited + currentStats.twoMonthsNoVisit}名
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600">潜在的損失額</div>
              <div className="text-2xl font-bold text-red-800">
                ¥{currentStats.totalLossAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Current Status Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-6">
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-green-600">リピート中(予約あり)</div>
                <div className="text-2xl font-bold text-green-700">
                  {currentStats.repeatingWithReservation}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  ¥{currentStats.totalRevenue.toLocaleString()}/月
                </div>
              </div>
              <UserCheck className="text-green-600" size={24} />
            </div>
          </div>
          
          <div className="card bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-600">リピート中(予約なし)</div>
                <div className="text-2xl font-bold text-amber-700">
                  {currentStats.repeatingNoReservation}
                </div>
              </div>
              <Users className="text-amber-600" size={24} />
            </div>
          </div>
          
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-yellow-600">先月来店(今月未来店)</div>
                <div className="text-2xl font-bold text-yellow-700">
                  {currentStats.lastMonthVisited}
                </div>
              </div>
              <Calendar className="text-yellow-600" size={24} />
            </div>
          </div>
          
          <div className="card bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-orange-600">先々月来店(2ヶ月未来店)</div>
                <div className="text-2xl font-bold text-orange-700">
                  {currentStats.twoMonthsNoVisit}
                </div>
              </div>
              <Calendar className="text-orange-600" size={24} />
            </div>
          </div>
          
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-red-600">3ヶ月以上未来店</div>
                <div className="text-2xl font-bold text-red-700">
                  {currentStats.threeMonthsNoVisit}
                </div>
                <div className="text-xs text-red-600 mt-1">
                  損失: ¥{currentStats.totalLossAmount.toLocaleString()}
                </div>
              </div>
              <UserX className="text-red-600" size={24} />
            </div>
          </div>
          
          <div className="card bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600">卒業</div>
                <div className="text-2xl font-bold text-gray-700">
                  {currentStats.graduated}
                </div>
              </div>
              <UserCheck className="text-gray-600" size={24} />
            </div>
          </div>
        </motion.div>
        
        {/* Customer Status Distribution */}
        <motion.div variants={itemVariants} className="card mb-6">
          <h3 className="font-semibold mb-3">顧客ステータス分布</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-xs">{item.name}</span>
                <span className="text-xs text-gray-500 ml-auto">{item.value}名</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `${value}名`} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        
        {/* Loss Amount Trend */}
        <motion.div variants={itemVariants} className="card mb-6">
          <h3 className="font-semibold mb-3">失客リスク分析</h3>
          <div className="text-xs text-gray-500 mb-2">3ヶ月以上来店されていない顧客により失われている想定売上</div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-red-800">現在の想定損失額</div>
                <div className="text-2xl font-bold text-red-900">
                  ¥{currentStats.totalLossAmount.toLocaleString()}
                </div>
              </div>
              <UserX className="text-red-600" size={32} />
            </div>
          </div>
          
          {/* 失客リスクの高い顧客リスト */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-2">失客リスクの高い顧客</div>
            {customers
              .filter(customer => {
                const status = calculateCustomerStatus(customer, visits);
                return status === 'three-months-no-visit' || 
                       status === 'two-months-no-visit' || 
                       status === 'last-month-visited';
              })
              .sort((a, b) => {
                const aStatus = calculateCustomerStatus(a, visits);
                const bStatus = calculateCustomerStatus(b, visits);
                // ステータスの優先順位でソート
                const statusPriority = {
                  'three-months-no-visit': 1,
                  'two-months-no-visit': 2,
                  'last-month-visited': 3,
                };
                return (statusPriority[aStatus as keyof typeof statusPriority] || 999) - 
                       (statusPriority[bStatus as keyof typeof statusPriority] || 999);
              })
              .slice(0, 10)
              .map(customer => {
                const status = calculateCustomerStatus(customer, visits);
                const lastVisit = visits
                  .filter(v => v.customerId === customer.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                const daysSinceLastVisit = lastVisit 
                  ? Math.floor((new Date().getTime() - new Date(lastVisit.date).getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                
                const statusConfig = {
                  'three-months-no-visit': { 
                    color: 'text-red-600 bg-red-50', 
                    label: '3ヶ月以上未来店',
                    icon: 'text-red-600'
                  },
                  'two-months-no-visit': { 
                    color: 'text-orange-600 bg-orange-50', 
                    label: '2ヶ月未来店',
                    icon: 'text-orange-600'
                  },
                  'last-month-visited': { 
                    color: 'text-yellow-600 bg-yellow-50', 
                    label: '今月未来店',
                    icon: 'text-yellow-600'
                  },
                };
                
                const config = statusConfig[status as keyof typeof statusConfig];
                
                return (
                  <div key={customer.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config?.color}`}>
                        <UserX size={16} className={config?.icon} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{customer.name}</div>
                        <div className="text-xs text-gray-500">
                          最終来店: {lastVisit ? `${daysSinceLastVisit}日前` : '記録なし'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded ${config?.color}`}>
                        {config?.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        月額: ¥{Math.round(customer.contract.amount / 12).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Analysis;