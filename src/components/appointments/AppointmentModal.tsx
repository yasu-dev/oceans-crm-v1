import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, FileText, Edit2, Trash2 } from 'lucide-react';
import { Appointment } from '../../types/appointment';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface AppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!appointment) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return '予定';
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル済み';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-2">{appointment.customerName}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6 space-y-4">
              {/* 日時情報 */}
              <div className="flex items-start gap-3">
                <Calendar className="text-blue-600 mt-1" size={20} />
                <div>
                  <div className="font-medium">
                    {format(new Date(appointment.startTime), 'yyyy年M月d日(E)', { locale: ja })}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Clock size={14} />
                    {format(new Date(appointment.startTime), 'HH:mm')} - 
                    {format(new Date(appointment.endTime), 'HH:mm')}
                  </div>
                </div>
              </div>

              {/* コース情報 */}
              <div className="flex items-start gap-3">
                <User className="text-blue-600 mt-1" size={20} />
                <div>
                  <div className="text-sm text-gray-600">コース</div>
                  <div className="font-medium">{appointment.title}</div>
                </div>
              </div>

              {/* メモ */}
              {appointment.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="text-blue-600 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-600">メモ</div>
                    <div className="text-sm mt-1">{appointment.notes}</div>
                  </div>
                </div>
              )}

              {/* 追加情報 */}
              <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
                <div>作成日時: {format(new Date(appointment.createdAt), 'yyyy/MM/dd HH:mm')}</div>
                <div>更新日時: {format(new Date(appointment.updatedAt), 'yyyy/MM/dd HH:mm')}</div>
              </div>
            </div>

            {/* アクション */}
            {appointment.status === 'scheduled' && (
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => onEdit?.(appointment)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 size={16} />
                  編集
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('この予約をキャンセルしますか？')) {
                      onDelete?.(appointment.id);
                      onClose();
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                  キャンセル
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentModal; 