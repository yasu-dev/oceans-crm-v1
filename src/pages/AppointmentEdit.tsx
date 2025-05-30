import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, FileText, Save } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const AppointmentEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { appointments, customers, updateAppointment } = useApp();
  
  const appointment = appointments.find(apt => apt.id === id);
  
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: ''
  });

  useEffect(() => {
    if (appointment) {
      const startDate = new Date(appointment.startTime);
      const endDate = new Date(appointment.endTime);
      
      setFormData({
        customerId: appointment.customerId,
        customerName: appointment.customerName,
        title: appointment.title,
        date: format(startDate, 'yyyy-MM-dd'),
        startTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm'),
        notes: appointment.notes || ''
      });
    }
  }, [appointment]);

  if (!appointment) {
    return (
      <motion.div
        className="page-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center py-8">
          <p className="text-gray-500">予約が見つかりませんでした</p>
          <button
            onClick={() => navigate('/appointments')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            カレンダーに戻る
          </button>
        </div>
      </motion.div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
    
    updateAppointment(appointment.id, {
      customerId: formData.customerId,
      customerName: formData.customerName,
      title: formData.title,
      startTime: startDateTime,
      endTime: endDateTime,
      notes: formData.notes,
      updatedAt: new Date()
    });
    
    navigate('/appointments');
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId,
        customerName: `${customer.firstName} ${customer.lastName}`
      }));
    }
  };

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/appointments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">予約を編集</h1>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {/* 顧客選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              顧客
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">選択してください</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* コース */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              コース
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：カット + カラー"
              required
            />
          </div>

          {/* 日付 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              日付
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* 時間 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                開始時間
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                終了時間
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              メモ
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="追加情報やメモを入力"
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Save size={18} />
              更新する
            </button>
            <button
              type="button"
              onClick={() => navigate('/appointments')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AppointmentEdit; 