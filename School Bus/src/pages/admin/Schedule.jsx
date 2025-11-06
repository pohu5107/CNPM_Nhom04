import { useState, useEffect } from 'react';
import ScheduleTable from '../../components/admin/schedules/ScheduleTable';
import ScheduleForm from '../../components/admin/schedules/ScheduleForm';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import Header from '../../components/admin/Header';
import { schedulesService } from '../../services/schedulesService';

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState({ title: '', message: '' });
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add', 'edit', 'view'

  // Load schedules from API
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await schedulesService.getAllSchedules();
      setSchedules(data);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải danh sách lịch trình: ' + err.message);
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormMode('add');
    setSelectedSchedule(null);
    setShowForm(true);
  };

  const handleEdit = (schedule) => {
    setFormMode('edit');
    setSelectedSchedule(schedule);
    setShowForm(true);
  };

  const handleView = (schedule) => {
    setFormMode('view');
    setSelectedSchedule(schedule);
    setShowForm(true);
  };

  const handleDelete = (schedule) => {
    setSelectedSchedule(schedule);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // Sử dụng schedule_id (ID gốc) hoặc ID formatted
      const deleteId = selectedSchedule.schedule_id || selectedSchedule.id;
      await schedulesService.deleteSchedule(deleteId);
      await fetchSchedules();
      setSelectedSchedule(null);
      setShowConfirm(false);
    } catch (err) {
      setError('Lỗi khi xóa lịch trình: ' + err.message);
      console.error('Error deleting schedule:', err);
    }
  };

  const handleSubmit = async (scheduleData) => {
    try {
      if (formMode === 'add') {
        await schedulesService.createSchedule(scheduleData);
      } else if (formMode === 'edit') {
        // Sử dụng schedule_id (ID gốc) hoặc ID formatted
        const updateId = selectedSchedule.schedule_id || selectedSchedule.id;
        await schedulesService.updateSchedule(updateId, scheduleData);
      }
      await fetchSchedules();
      setShowForm(false);
      setSelectedSchedule(null);
      setError(null);
    } catch (err) {
      console.error('Error saving schedule:', err);
      
      // Check for conflict errors
      if (err.response?.status === 409) {
        const response = err.response.data;
        let title = 'Xung đột lịch trình';
        let message = response.details || response.message || 'Có xung đột trong lịch trình';
        
        if (response.message === 'DRIVER_CONFLICT') {
          title = 'Tài xế đã có lịch trình';
          message = response.details || 'Tài xế này đã có lịch trình khác trong cùng thời gian';
        } else if (response.message === 'BUS_CONFLICT') {
          title = 'Xe bus đã có lịch trình'; 
          message = response.details || 'Xe bus này đã có lịch trình khác trong cùng thời gian';
        }
        
        setErrorDetails({ title, message });
        setShowErrorModal(true);
      } else {
        setError('Lỗi khi lưu lịch trình: ' + err.message);
      }
    }
  };

  return (
    <div>
      <Header title="QUẢN LÝ LỊCH TRÌNH" />
      {error && (
        <div className="mx-8 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <ScheduleTable
        schedules={schedules}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          formMode === 'add' ? 'Thêm lịch trình mới' :
          formMode === 'edit' ? 'Chỉnh sửa lịch trình' :
          'Thông tin lịch trình'
        }
        size="lg"
      >
        <ScheduleForm
          schedule={selectedSchedule}
          mode={formMode}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa lịch trình "${selectedSchedule?.id}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorDetails.title}
        size="md"
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-gray-700">{errorDetails.message}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowErrorModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SchedulesPage;
