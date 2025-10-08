import { useState, useEffect } from 'react';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';

const ParentForm = ({ parent, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parent) {
      setFormData({
        name: parent.name || '',
        email: parent.email || '',
        phone: parent.phone || '',
        address: parent.address || '',
        status: parent.status || 'active'
      });
    }
  }, [parent]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
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
      <FormInput
        label="Họ và tên"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Nhập họ và tên"
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

export default ParentForm;