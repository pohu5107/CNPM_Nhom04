import { useState, useEffect } from 'react';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { routes, buses } from '../../../data/mockData';

const DriverForm = ({ driver, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    driverCode: '',
    phone: '',
    email: '',
    licenseNumber: '',
    experience: '',
    busNumber: '',
    route: '',
    address: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        driverCode: driver.driverCode || '',
        phone: driver.phone || '',
        email: driver.email || '',
        licenseNumber: driver.licenseNumber || '',
        experience: driver.experience || '',
        busNumber: driver.busNumber || '',
        route: driver.route || '',
        address: driver.address || '',
        status: driver.status || 'active'
      });
    }
  }, [driver]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên là bắt buộc';
    }

    if (mode === 'add' && !formData.driverCode.trim()) {
      newErrors.driverCode = 'Mã tài xế là bắt buộc';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (mode === 'add' && !formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'Số bằng lái là bắt buộc';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Kinh nghiệm là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    // Don't validate busNumber and route for edit mode (managed in schedule page)
    if (mode === 'add') {
      if (!formData.busNumber) {
        newErrors.busNumber = 'Xe buýt là bắt buộc';
      }
      if (!formData.route) {
        newErrors.route = 'Tuyến đường là bắt buộc';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onCancel();
      return;
    }

    if (validateForm()) {
      setLoading(true);
      try {
        await onSubmit(formData);
      } finally {
        setLoading(false);
      }
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormInput
          label="Họ và tên"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Nhập họ và tên tài xế"
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Mã tài xế"
          name="driverCode"
          value={formData.driverCode}
          onChange={handleChange}
          error={errors.driverCode}
          placeholder="Nhập mã tài xế"
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Số điện thoại"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="Nhập số điện thoại"
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Nhập địa chỉ email"
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Số bằng lái"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleChange}
          error={errors.licenseNumber}
          placeholder="Nhập số bằng lái xe"
          required={mode === 'add'}
          readOnly={isReadOnly || mode === 'edit'}
        />

        <FormInput
          label="Kinh nghiệm"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          error={errors.experience}
          placeholder="VD: 10 năm"
          required
          readOnly={isReadOnly}
        />

        {/* Show bus and route info but make readonly in edit mode */}
        <FormInput
          label="Xe buýt"
          name="busNumber"
          type={mode === 'add' ? 'select' : 'text'}
          value={formData.busNumber}
          onChange={handleChange}
          error={errors.busNumber}
          options={mode === 'add' ? buses.map(bus => ({ value: bus, label: bus })) : undefined}
          required={mode === 'add'}
          readOnly={isReadOnly || mode === 'edit'}
          placeholder={mode === 'edit' ? 'Quản lý tại trang phân công lịch trình' : undefined}
        />

        <FormInput
          label="Tuyến đường"
          name="route"
          type={mode === 'add' ? 'select' : 'text'}
          value={formData.route}
          onChange={handleChange}
          error={errors.route}
          options={mode === 'add' ? routes.map(route => ({ value: route, label: route })) : undefined}
          required={mode === 'add'}
          readOnly={isReadOnly || mode === 'edit'}
          placeholder={mode === 'edit' ? 'Quản lý tại trang phân công lịch trình' : undefined}
        />

        {!isReadOnly && (
          <FormInput
            label="Trạng thái"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'active', label: 'Hoạt động' },
              { value: 'inactive', label: 'Không hoạt động' }
            ]}
          />
        )}

        {isReadOnly && (
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <div style={{ padding: '10px 0' }}>
              <span className={`status-badge ${formData.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                {formData.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
          </div>
        )}
      </div>

     

      <FormInput
        label="Địa chỉ"
        name="address"
        type="textarea"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        placeholder="Nhập địa chỉ đầy đủ"
        required
        readOnly={isReadOnly}
        rows={3}
      />

      <div className="modal-footer">
        <Button variant="secondary" onClick={onCancel}>
          {isReadOnly ? 'Đóng' : 'Hủy'}
        </Button>
        {!isReadOnly && (
          <Button type="submit" loading={loading}>
            {mode === 'add' ? 'Thêm mới' : 'Cập nhật'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default DriverForm;