import { useState, useEffect } from 'react';
import DriverTable from '../../components/admin/drivers/DriverTable';
import DriverForm from '../../components/admin/drivers/DriverForm';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { driversService } from '../../services/driversService';
import Header from '../../components/admin/Header';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add', 'edit', 'view'


  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await driversService.getAllDrivers();
      setDrivers(data);
      setError(null);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

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

  const handleView = async (driver) => {
    try {
      setFormMode('view');
      
     
      const driverDetails = await driversService.getDriverDetails(driver.id);
      setSelectedDriver(driverDetails);
      setShowForm(true);
    } catch (err) {
      setError('Lỗi khi lấy thông tin chi tiết tài xế: ' + err.message);
    
      

      setSelectedDriver(driver);
      setShowForm(true);
    }
  };

  const handleDelete = (driver) => {
    setSelectedDriver(driver);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await driversService.deleteDriver(selectedDriver.id);
      await fetchDrivers(); // Reload list
      setSelectedDriver(null);
      setShowConfirm(false);
    } catch (err) {
      setError('Lỗi khi xóa tài xế: ' + err.message);
      console.error('Error deleting driver:', err);
    }
  };

  const handleSubmit = async (driverData) => {
    try {
      if (formMode === 'add') {
        await driversService.createDriver(driverData);
      } else if (formMode === 'edit') {
        await driversService.updateDriver(selectedDriver.id, driverData);
      }
      await fetchDrivers(); 
      setShowForm(false);
      setSelectedDriver(null);
      setError(null);
    } catch (err) {
      setError('Lỗi khi lưu tài xế: ' + err.message);
      console.error('Error saving driver:', err);
    }
  };

  return (
    <div>
      <Header title="QUẢN LÝ TÀI XẾ" />
      {error && (
        <div className="mx-8 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <DriverTable
        drivers={drivers}
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
          formMode === 'add' ? 'Thêm tài xế mới' :
          formMode === 'edit' ? 'Chỉnh sửa thông tin tài xế' :
          'Thông tin chi tiết tài xế'
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