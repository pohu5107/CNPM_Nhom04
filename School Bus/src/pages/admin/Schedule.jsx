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

  // Sửa handleEdit thành async
  const handleEdit = async (scheduleSummary) => {
    try {
      setLoading(true); // Hiển thị loading
      const id = scheduleSummary.schedule_id || scheduleSummary.id;
      // Gọi API lấy chi tiết đầy đủ
      const fullSchedule = await schedulesService.getAdminScheduleById(id); 
      
      setFormMode('edit');
      setSelectedSchedule(fullSchedule); // Dùng đối tượng đầy đủ
      setShowForm(true);
    } catch (err) {
      setError('Lỗi khi tải chi tiết lịch trình: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sửa handleView thành async
  const handleView = async (scheduleSummary) => {
    try {
      setLoading(true); // Hiển thị loading
      const id = scheduleSummary.schedule_id || scheduleSummary.id;
      // Gọi API lấy chi tiết đầy đủ
      const fullSchedule = await schedulesService.getAdminScheduleById(id);
      
      setFormMode('view');
      setSelectedSchedule(fullSchedule); // Dùng đối tượng đầy đủ
      setShowForm(true);
    } catch (err) {
      setError('Lỗi khi tải chi tiết lịch trình: ' + err.message);
    } finally {
      setLoading(false);
    }
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
      // Luôn hiển thị modal lỗi có nội dung thân thiện khi thêm/sửa
      const resp = err?.response || {};
      const rawMessage = resp.data?.details || resp.data?.message || err.message || '';
      const title = resp.status === 409 ? 'Xung đột lịch trình' : 'Không thể lưu lịch trình';
      const message = mapErrorToNaturalMessage(rawMessage);
      setError(null); // không hiển thị banner
      setErrorDetails({ title, message });
      setShowErrorModal(true);
    }
  };

  return (
    <div>
      <Header title="QUẢN LÝ LỊCH TRÌNH" />
 

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
        title="Thông báo lỗi"
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
              <p className="text-gray-700 font-medium">{errorDetails.message}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowErrorModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


function mapErrorToNaturalMessage(rawMessage = '') {
  if (!rawMessage) return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
  const msg = rawMessage.toUpperCase();
  if (msg.includes('DRIVER_CONFLICT')) {
    return 'Tài xế này đã được phân công một lịch trình khác trùng thời gian (cùng ngày và ca ). Bạn hãy chọn tài xế khác hoặc điều chỉnh ca làm việc.';
  }
  if (msg.includes('BUS_CONFLICT')) {
    return 'Xe buýt này đã có lịch trình khác. Vui lòng chọn xe khác.';
  }
  if (msg.includes('ROUTE_CONFLICT')) {
    return 'Tuyến đường đã bị trùng về thời gian với một lịch trình khác. Bạn có thể đổi tuyến hoặc thời gian.';
  }
  if (msg.includes('VALIDATION')) {
    return 'Dữ liệu nhập chưa hợp lệ. Kiểm tra lại các trường bắt buộc và định dạng thời gian.';
  }
  return rawMessage; // fallback hiển thị nguyên bản
}

// Gợi ý xử lý thêm dựa trên loại xung đột
function renderConflictHints(rawMessage, schedule) {
  if (!rawMessage) return null;
  const msg = rawMessage.toUpperCase();
  const baseClass = 'text-xs text-gray-600 bg-gray-50 rounded p-3 border border-gray-200';
  if (msg.includes('DRIVER_CONFLICT')) {
    return (
      <div className={baseClass}>
        <p className="font-medium text-gray-700 mb-1">Gợi ý khắc phục:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Kiểm tra danh sách lịch trình hiện tại của tài xế trong khoảng thời gian này.</li>
          <li>Chọn một tài xế khác chưa có lịch.</li>
          <li>Điều chỉnh giờ bắt đầu / kết thúc để tránh trùng lặp.</li>
        </ul>
      </div>
    );
  }
  if (msg.includes('BUS_CONFLICT')) {
    return (
      <div className={baseClass}>
        <p className="font-medium text-gray-700 mb-1">Gợi ý khắc phục:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Chọn một xe buýt khác còn trống.</li>
          <li>Kiểm tra lại lịch trình đã gán cho xe để tránh trùng giờ.</li>
          <li>Điều chỉnh thời gian hoặc tách ca nếu cần.</li>
        </ul>
      </div>
    );
  }
  if (msg.includes('ROUTE_CONFLICT')) {
    return (
      <div className={baseClass}>
        <p className="font-medium text-gray-700 mb-1">Gợi ý khắc phục:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Chọn tuyến đường khác chưa được sử dụng trong khoảng thời gian này.</li>
         
        </ul>
      </div>
    );
  }
  return null;
}

export default SchedulesPage;
