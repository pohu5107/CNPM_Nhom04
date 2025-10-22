import { useState, useEffect } from 'react';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';

const ParentForm = ({ parent, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parent) {
      console.log('🎯 Setting parent form data with:', parent);
      setFormData({
        name: parent.name || '',
        email: parent.email || '',
        phone: parent.phone || '',
        relationship: parent.relationship || '',
        address: parent.address || ''
      });
    }
  }, [parent]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên là bắt buộc';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
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
        label="Quan hệ"
        name="relationship"
        type="select"
        value={formData.relationship}
        onChange={handleChange}
        error={errors.relationship}
        placeholder="Chọn mối quan hệ"
        options={[
          { value: 'Ba', label: 'Ba' },
          { value: 'Mẹ', label: 'Mẹ' },
          { value: 'Ông', label: 'Ông' },
          { value: 'Bà', label: 'Bà' },
          { value: 'Anh', label: 'Anh' },
          { value: 'Chị', label: 'Chị' },
          { value: 'Khác', label: 'Khác' }
        ]}
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

      <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-slate-200">
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