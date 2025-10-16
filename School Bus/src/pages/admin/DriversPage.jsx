import { useState } from 'react';
import DriverTable from '../../components/admin/drivers/DriverTable';
import DriverForm from '../../components/admin/drivers/DriverForm';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { mockDrivers } from '../../data/mockData';

const DriversPage = () => {
  const [drivers, setDrivers] = useState(mockDrivers);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add', 'edit', 'view'

  const handleAdd = () => {
    setFormMode('add');
    setSelectedDriver(null);
    setShowForm(true);
  };

  const handleEdit = (driver) => {
    setFormMode('edit');
    setSelectedDriver(driver);
    setShowForm(true);
  };

  const handleView = (driver) => {
    setFormMode('view');
    setSelectedDriver(driver);
    setShowForm(true);
  };

  const handleDelete = (driver) => {
    setSelectedDriver(driver);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setDrivers(drivers.filter(d => d.id !== selectedDriver.id));
    setSelectedDriver(null);
  };

  const handleSubmit = (driverData) => {
    if (formMode === 'add') {
      const newDriver = {
        ...driverData,
        id: Math.max(...drivers.map(d => d.id)) + 1,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setDrivers([...drivers, newDriver]);
    } else if (formMode === 'edit') {
      setDrivers(drivers.map(d => 
        d.id === selectedDriver.id ? { ...d, ...driverData } : d
      ));
    }
    setShowForm(false);
    setSelectedDriver(null);
  };

  return (
    <div className="w-full h-full space-y-6">
      <div className="w-full">
        <DriverTable
          onAdd={handleAdd}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          formMode === 'add' ? 'Thêm tài xế mới' :
          formMode === 'edit' ? 'Chỉnh sửa thông tin tài xế' :
          'Thông tin tài xế'
        }
        size="lg"
      >
        <DriverForm
          driver={selectedDriver}
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
        message={`Bạn có chắc chắn muốn xóa tài xế "${selectedDriver?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default DriversPage;