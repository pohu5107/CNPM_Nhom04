import { useState, useEffect } from 'react';
import ScheduleTable from '../../components/admin/schedules/ScheduleTable';
import ScheduleForm from '../../components/admin/schedules/ScheduleForm';
import ScheduleConflictAlert from '../../components/admin/schedules/ScheduleConflictAlert';
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
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add', 'view'

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
      }
      await fetchSchedules();
      setShowForm(false);
      setSelectedSchedule(null);
      setError(null);
    } catch (err) {
      console.error('Error saving schedule:', err);
      
      // Xử lý lỗi conflict đặc biệt
      if (err.response?.status === 409) {
        const errorData = err.response.data;
        setError(errorData.message + (errorData.suggestion ? '. ' + errorData.suggestion : ''));
      } else {
        setError('Lỗi khi lưu lịch trình: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div>
      <Header title="QUẢN LÝ LỊCH TRÌNH" />
      <ScheduleConflictAlert 
        error={error} 
        onClose={() => setError(null)} 
      />

      <ScheduleTable
        schedules={schedules}
        loading={loading}
        onAdd={handleAdd}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          formMode === 'add' ? 'Thêm lịch trình mới' :
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
    </div>
  );
};

export default SchedulesPage;
