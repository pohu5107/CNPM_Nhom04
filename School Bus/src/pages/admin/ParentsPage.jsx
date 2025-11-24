import { useState, useEffect } from 'react';
import ParentTable from '../../components/admin/parents/ParentTable';
import ParentForm from '../../components/admin/parents/ParentForm';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import Pagination from '../../components/UI/Pagination';
import { parentsService } from '../../services/parentsService';
import Header from '../../components/admin/Header';

const ParentsPage = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add', 'edit', 'view'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const data = await parentsService.getAllParents();
      setParents(data);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải danh sách phụ huynh: ' + err.message);
      console.error('Error fetching parents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormMode('add');
    setSelectedParent(null);
    setShowForm(true);
  };

  const handleEdit = (parent) => {
    setFormMode('edit');
    setSelectedParent(parent);
    setShowForm(true);
  };

  const handleView = (parent) => {
    setFormMode('view');
    setSelectedParent(parent);
    setShowForm(true);
  };

  const handleDelete = (parent) => {
    setSelectedParent(parent);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await parentsService.deleteParent(selectedParent.id);
      await fetchParents(); // Reload list
      setSelectedParent(null);
      setShowConfirm(false);
    } catch (err) {
      setError('Lỗi khi xóa phụ huynh: ' + err.message);
      console.error('Error deleting parent:', err);
    }
  };

  const handleSubmit = async (parentData) => {
    try {
      if (formMode === 'add') {
        await parentsService.createParent(parentData);
      } else if (formMode === 'edit') {
        await parentsService.updateParent(selectedParent.id, parentData);
      }
      await fetchParents(); // Reload list
      setShowForm(false);
      setSelectedParent(null);
      setError(null);
    } catch (err) {
      setError('Lỗi khi lưu phụ huynh: ' + err.message);
      console.error('Error saving parent:', err);
    }
  };

  return (
    <div>
      <Header title="QUẢN LÝ PHỤ HUYNH" />
      {error && (
        <div className="mx-8 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <ParentTable
        parents={parents}
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
          formMode === 'add' ? 'Thêm phụ huynh mới' :
          formMode === 'edit' ? 'Chỉnh sửa thông tin phụ huynh' :
          'Thông tin phụ huynh'
        }
        size="lg"
      >
        <ParentForm
          parent={selectedParent}
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
        message={`Bạn có chắc chắn muốn xóa phụ huynh "${selectedParent?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default ParentsPage;