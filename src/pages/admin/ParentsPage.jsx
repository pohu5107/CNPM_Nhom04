import { useState } from 'react';
import ParentTable from '../../components/admin/parents/ParentTable';
import ParentForm from '../../components/admin/parents/ParentForm';
import ChildrenListModal from '../../components/admin/parents/ChildrenListModal';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import Pagination from '../../components/UI/Pagination';
import { mockParents } from '../../data/mockData';

const ParentsPage = () => {
  const [parents, setParents] = useState(mockParents);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showChildrenList, setShowChildrenList] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add', 'edit', 'view'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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

  const handleViewChildren = (parent) => {
    setSelectedParent(parent);
    setShowChildrenList(true);
  };

  const confirmDelete = () => {
    setParents(parents.filter(p => p.id !== selectedParent.id));
    setSelectedParent(null);
  };

  const handleSubmit = (parentData) => {
    if (formMode === 'add') {
      const newParent = {
        ...parentData,
        id: Math.max(...parents.map(p => p.id)) + 1,
        createdAt: new Date().toISOString().split('T')[0],
        children: []
      };
      setParents([...parents, newParent]);
    } else if (formMode === 'edit') {
      setParents(parents.map(p => 
        p.id === selectedParent.id ? { ...p, ...parentData } : p
      ));
    }
    setShowForm(false);
    setSelectedParent(null);
  };

  return (
    <div>
      <ParentTable
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onViewChildren={handleViewChildren}
      />

      {/* Pagination - placeholder for future implementation */}
      {/* <Pagination
        currentPage={currentPage}
        totalItems={parents.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      /> */}

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

      {/* Children List Modal */}
      <ChildrenListModal
        isOpen={showChildrenList}
        onClose={() => setShowChildrenList(false)}
        parent={selectedParent}
      />

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