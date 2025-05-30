import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ArrowLeft, Calendar, Clock, User, FileText, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const AppointmentNew = () => {
  const navigate = useNavigate();
  const { customers, addAppointment } = useApp();
  
  const [formData, setFormData] = useState({
    customerId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    endTime: '11:30',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      alert('顧客を選択してください');
      return;
    }

    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    if (!selectedCustomer) return;

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    const newAppointment = {
      id: `A-${Date.now()}`,
      customerId: formData.customerId,
      customerName: `${selectedCustomer.lastName}${selectedCustomer.firstName}`,
      startTime: startDateTime,
      endTime: endDateTime,
      title: selectedCustomer.contract.course,
      notes: formData.notes,
      status: 'scheduled' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addAppointment(newAppointment);
    navigate('/appointments');
  };

  // 時間オプションを生成
  const timeOptions = [];
  for (let hour = 9; hour < 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/appointments')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">新規予約作成</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 顧客選択 */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-blue-600" size={20} />
            <h2 className="text-lg font-medium">顧客情報</h2>
          </div>
          
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">顧客を選択</span>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">選択してください</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.lastName} {customer.firstName} - {customer.contract.course}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* 日時選択 */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-blue-600" size={20} />
            <h2 className="text-lg font-medium">日時設定</h2>
          </div>
          
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-1 block">予約日</span>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">開始時刻</span>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-1 block">終了時刻</span>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* メモ */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-blue-600" size={20} />
            <h2 className="text-lg font-medium">メモ</h2>
          </div>
          
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="予約に関するメモを入力"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/appointments')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Save size={20} />
            予約を作成
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AppointmentNew; 