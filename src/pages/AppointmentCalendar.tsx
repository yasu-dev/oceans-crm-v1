import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { CalendarView, Appointment } from '../types/appointment';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import AppointmentModal from '../components/appointments/AppointmentModal';

const AppointmentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const weekViewRef = useRef<HTMLDivElement>(null);
  const dayViewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // コンテキストから予約データを取得
  const { appointments, updateAppointment, deleteAppointment, customers } = useApp();

  // ビューが変更されたときに9:00にスクロール
  useEffect(() => {
    if (view === 'week' && weekViewRef.current) {
      const hourHeight = 60; // 各時間の高さ
      weekViewRef.current.scrollTop = hourHeight * 9; // 9:00の位置
    } else if (view === 'day' && dayViewRef.current) {
      const hourHeight = 80; // 各時間の高さ
      dayViewRef.current.scrollTop = hourHeight * 9; // 9:00の位置
    }
  }, [view]);

  // 予約をクリックしたときの処理
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  // 予約のキャンセル処理
  const handleAppointmentDelete = (appointmentId: string) => {
    updateAppointment(appointmentId, { status: 'cancelled' });
  };

  // カレンダーナビゲーション
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    setCurrentDate(newDate);
  };

  // 現在の期間のラベルを取得
  const getDateRangeLabel = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = currentDate.getDate();
    
    switch (view) {
      case 'month':
        return `${year}年${month + 1}月`;
      case 'week': {
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = startOfWeek.getDay();
        startOfWeek.setDate(date - dayOfWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.getMonth() + 1}月${startOfWeek.getDate()}日 - ${endOfWeek.getMonth() + 1}月${endOfWeek.getDate()}日`;
      }
      case 'day':
        return `${year}年${month + 1}月${date}日（${['日', '月', '火', '水', '木', '金', '土'][currentDate.getDay()]}）`;
    }
  };

  // 月表示のカレンダーデータを生成
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // 週表示の時間スロットを生成
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // 日付のイベントを取得
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate.getFullYear() === date.getFullYear() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getDate() === date.getDate();
    });
  };

  // 日付をクリックしたときの処理
  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setView('day');
  };

  // 検索結果のフィルタリング
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return appointments.filter(apt => {
      const customerName = apt.customerName.toLowerCase();
      const title = apt.title.toLowerCase();
      const notes = apt.notes ? apt.notes.toLowerCase() : '';
      
      return customerName.includes(query) || 
             title.includes(query) || 
             notes.includes(query);
    }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [searchQuery, appointments]);

  // 検索結果をクリックしたときの処理
  const handleSearchResultClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const renderMonthView = () => {
    const days = getMonthDays();
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map((day, index) => (
            <div 
              key={day} 
              className={`bg-gray-50 px-2 py-1 text-center text-xs font-medium ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const dayAppointments = getAppointmentsForDate(day);
            const dayOfWeek = day.getDay();
            
            return (
              <div
                key={index}
                className={`
                  bg-white p-2 min-h-[120px] cursor-pointer hover:bg-gray-50 relative
                  ${!isCurrentMonth ? 'text-gray-400' : ''}
                  ${isToday ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : ''}
                `}
                onClick={() => handleDateClick(day)}
              >
                {isToday && (
                  <div className="absolute top-1 right-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    今日
                  </div>
                )}
                <div className={`text-sm font-medium ${
                  isToday ? 'text-blue-600' : 
                  dayOfWeek === 0 ? 'text-red-600' : 
                  dayOfWeek === 6 ? 'text-blue-600' : ''
                }`}>
                  {day.getDate()}
                </div>
                <div className="mt-1 space-y-1">
                  {dayAppointments.slice(0, 3).map(apt => (
                    <div
                      key={apt.id}
                      className={`text-xs p-1 rounded truncate ${
                        apt.status === 'cancelled' 
                          ? 'bg-gray-100 text-gray-500 line-through' 
                          : apt.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAppointmentClick(apt);
                      }}
                    >
                      {apt.startTime.getHours()}:{apt.startTime.getMinutes().toString().padStart(2, '0')} {apt.customerName}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500">
                      他{dayAppointments.length - 3}件
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
        <div className="grid grid-cols-8 gap-px bg-gray-200 sticky top-0 z-10 flex-shrink-0">
          <div className="bg-gray-50 p-2"></div>
          {days.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const dayOfWeek = day.getDay();
            return (
              <div
                key={index}
                className={`bg-gray-50 p-2 text-center ${
                  isToday ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : ''
                }`}
              >
                <div className={`text-xs ${
                  dayOfWeek === 0 ? 'text-red-500' : 
                  dayOfWeek === 6 ? 'text-blue-500' : 
                  'text-gray-500'
                }`}>
                  {['日', '月', '火', '水', '木', '金', '土'][day.getDay()]}
                </div>
                <div className={`text-sm font-medium ${
                  isToday ? 'text-blue-600' : 
                  dayOfWeek === 0 ? 'text-red-600' : 
                  dayOfWeek === 6 ? 'text-blue-600' : ''
                }`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto" ref={weekViewRef}>
          <div className="grid grid-cols-8 gap-px bg-gray-200">
            {hours.map(hour => (
              <React.Fragment key={`hour-group-${hour}`}>
                <div key={`hour-${hour}`} className="bg-gray-50 p-2 text-right text-xs text-gray-500 sticky left-0 z-10">
                  {hour}:00
                </div>
                {days.map((day, dayIndex) => {
                  const hourAppointments = appointments.filter(apt => {
                    const aptDate = new Date(apt.startTime);
                    return aptDate.getFullYear() === day.getFullYear() &&
                           aptDate.getMonth() === day.getMonth() &&
                           aptDate.getDate() === day.getDate() &&
                           aptDate.getHours() === hour;
                  });
                  
                  return (
                    <div
                      key={`${hour}-${dayIndex}`}
                      className="bg-white p-1 min-h-[60px] border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        const selectedDateTime = new Date(day);
                        selectedDateTime.setHours(hour);
                        setSelectedDate(selectedDateTime);
                      }}
                    >
                      {hourAppointments.map(apt => (
                        <div
                          key={apt.id}
                          className={`text-xs p-1 rounded mb-1 ${
                            apt.status === 'cancelled' 
                              ? 'bg-gray-100 text-gray-500 line-through' 
                              : apt.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppointmentClick(apt);
                          }}
                        >
                          <div className="font-medium">{apt.customerName}</div>
                          <div>{apt.title}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayAppointments = getAppointmentsForDate(currentDate);
    const dayOfWeek = currentDate.getDay();
    const isToday = currentDate.toDateString() === new Date().toDateString();
    
    return (
      <div className="bg-white rounded-lg shadow h-[600px] overflow-y-auto" ref={dayViewRef}>
        {/* 日付ヘッダー */}
        <div className={`sticky top-0 z-10 bg-white border-b border-gray-200 p-4 ${
          isToday ? 'bg-blue-50' : ''
        }`}>
          <div className={`text-lg font-medium ${
            isToday ? 'text-blue-600' : 
            dayOfWeek === 0 ? 'text-red-600' : 
            dayOfWeek === 6 ? 'text-blue-600' : ''
          }`}>
            {currentDate.toLocaleDateString('ja-JP', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>
        
        {hours.map(hour => {
          const hourAppointments = dayAppointments.filter(apt => 
            new Date(apt.startTime).getHours() === hour
          );
          
          return (
            <div
              key={hour}
              className="flex border-b border-gray-200 hover:bg-gray-50"
            >
              <div className="w-20 p-3 text-right text-sm text-gray-500 flex-shrink-0">
                {hour}:00
              </div>
              <div className="flex-1 p-3 min-h-[80px]">
                {hourAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className={`p-3 rounded-lg mb-2 cursor-pointer ${
                      apt.status === 'cancelled' 
                        ? 'bg-gray-100 text-gray-600' 
                        : apt.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAppointmentClick(apt);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${apt.status === 'cancelled' ? 'line-through' : ''}`}>
                        {apt.customerName}
                      </span>
                      <span className="text-sm">
                        {apt.startTime.getHours()}:{apt.startTime.getMinutes().toString().padStart(2, '0')} - 
                        {apt.endTime.getHours()}:{apt.endTime.getMinutes().toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className={`text-sm ${apt.status === 'cancelled' ? 'line-through' : ''}`}>
                      {apt.title}
                    </div>
                    {apt.notes && (
                      <div className={`text-xs mt-1 ${
                        apt.status === 'cancelled' ? 'text-gray-500' : 'text-blue-600'
                      }`}>
                        {apt.notes}
                      </div>
                    )}
                    {apt.status === 'cancelled' && (
                      <div className="text-xs mt-1 text-red-600 font-medium">
                        キャンセル済み
                      </div>
                    )}
                    {apt.status === 'completed' && (
                      <div className="text-xs mt-1 text-green-600 font-medium">
                        完了
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* ヘッダーボタンを折り返せるよう flex-wrap を追加 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={() => setCurrentDate(new Date())}
          className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
        >
          今日
        </button>
        <button 
          className="btn-primary bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 px-5 py-2.5 rounded-xl"
          onClick={() => navigate('/appointments/new')}
        >
          <Plus size={20} />
          <span className="font-medium">予約を追加</span>
        </button>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search size={20} />
          <span>検索</span>
        </button>
      </div>

      {/* 本日の予約統計 */}
      <div className="card mb-4 p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">本日の予約状況</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(apt => {
                const aptDate = new Date(apt.startTime);
                const today = new Date();
                return aptDate.toDateString() === today.toDateString() && apt.status === 'scheduled';
              }).length}
            </div>
            <div className="text-xs text-gray-500">予定</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(apt => {
                const aptDate = new Date(apt.startTime);
                const today = new Date();
                return aptDate.toDateString() === today.toDateString() && apt.status === 'completed';
              }).length}
            </div>
            <div className="text-xs text-gray-500">完了</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {appointments.filter(apt => {
                const aptDate = new Date(apt.startTime);
                const today = new Date();
                return aptDate.toDateString() === today.toDateString() && apt.status === 'cancelled';
              }).length}
            </div>
            <div className="text-xs text-gray-500">キャンセル</div>
          </div>
        </div>
      </div>

      {/* ビュー切り替えとナビゲーション */}
      <div className="card mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-medium text-center md:min-w-[200px]">
              {getDateRangeLabel()}
            </h2>
            <button
              onClick={() => navigateDate('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded text-sm ${
                view === 'month'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              月
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded text-sm ${
                view === 'week'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              週
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 rounded text-sm ${
                view === 'day'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              日
            </button>
          </div>
        </div>
      </div>

      {/* カレンダー表示 */}
      <div className="mb-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>

      {/* 予約詳細モーダル */}
      <AppointmentModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        onEdit={(appointment) => {
          navigate(`/appointments/edit/${appointment.id}`);
        }}
        onDelete={handleAppointmentDelete}
      />

      {/* 検索モーダル */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">予約を検索</h2>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="顧客名、予約内容、メモで検索..."
                  autoFocus
                />
              </div>
              {searchQuery && (
                <div className="mt-2 text-sm text-gray-500">
                  {searchResults.length}件の検索結果
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {searchQuery && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  「{searchQuery}」に一致する予約が見つかりませんでした
                </div>
              )}
              
              {searchResults.map(appointment => (
                <div
                  key={appointment.id}
                  className="mb-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSearchResultClick(appointment)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-lg">{appointment.customerName}</h3>
                      <p className="text-gray-600">{appointment.title}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'cancelled' 
                        ? 'bg-gray-100 text-gray-600' 
                        : appointment.status === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {appointment.status === 'cancelled' ? 'キャンセル' : 
                       appointment.status === 'completed' ? '完了' : '予定'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>
                        {new Date(appointment.startTime).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={16} />
                      <span>
                        {new Date(appointment.startTime).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(appointment.endTime).toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {appointment.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AppointmentCalendar; 