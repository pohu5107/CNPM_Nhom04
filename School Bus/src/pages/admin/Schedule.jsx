import { useState, useEffect } from 'react';
import ScheduleTable from '../../components/admin/schedules/ScheduleTable';
import ScheduleForm from '../../components/admin/schedules/ScheduleForm';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import Header from '../../components/admin/Header';
import { schedulesService } from '../../services/schedulesService';
import AssignStudentsModal from '../../components/admin/AssignStudentsModal';

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add', 'edit', 'view'
  const [showAssign, setShowAssign] = useState(false);

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

  const handleEdit = async (schedule) => {
    try {
      setLoading(true);
      // Fetch chi tiết từ backend thay vì dùng dữ liệu từ bảng
      const scheduleId = schedule.schedule_id || schedule.id;
      const detailSchedule = await schedulesService.getAdminScheduleById(scheduleId);
      
      setFormMode('edit');
      setSelectedSchedule(detailSchedule);
      setShowForm(true);
    } catch (err) {
      setError('Lỗi khi lấy chi tiết lịch trình: ' + err.message);
      console.error('Error fetching schedule detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (schedule) => {
    try {
      setLoading(true);
      // Fetch chi tiết từ backend thay vì dùng dữ liệu từ bảng
      const scheduleId = schedule.schedule_id || schedule.id;
      const detailSchedule = await schedulesService.getAdminScheduleById(scheduleId);
      
      setFormMode('view');
      setSelectedSchedule(detailSchedule);
      setShowForm(true);
    } catch (err) {
      setError('Lỗi khi lấy chi tiết lịch trình: ' + err.message);
      console.error('Error fetching schedule detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (schedule) => {
    setSelectedSchedule(schedule);
    setShowConfirm(true);
  };

  const handleAssign = (schedule) => {
    setSelectedSchedule(schedule);
    setShowAssign(true);
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
      setError('Lỗi khi lưu lịch trình: ' + err.message);
      console.error('Error saving schedule:', err);
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
        onAssign={handleAssign}
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

      {/* Assign Students Modal */}
      <AssignStudentsModal
        isOpen={showAssign}
        onClose={() => setShowAssign(false)}
        schedule={selectedSchedule}
        onChanged={() => fetchSchedules()}
      />
    </div>
  );
};

export default SchedulesPage;
