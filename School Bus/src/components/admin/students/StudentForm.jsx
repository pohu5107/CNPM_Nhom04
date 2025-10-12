import { useState, useEffect } from 'react';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { mockParents, classes, routes, pickupPoints } from '../../../data/mockData';

const StudentForm = ({ student, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    studentCode: '',
    class: '',
    parentId: '',
    parentName: '',
    dateOfBirth: '',
    address: '',
    busRoute: '',
    pickupPoint: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        studentCode: student.studentCode || '',
        class: student.class || '',
        parentId: student.parentId || '',
        parentName: student.parentName || '',
        dateOfBirth: student.dateOfBirth || '',
        address: student.address || '',
        busRoute: student.busRoute || '',
        pickupPoint: student.pickupPoint || ''
      });
    }
  }, [student]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên là bắt buộc';
    }

    if (!formData.studentCode.trim()) {
      newErrors.studentCode = 'Mã học sinh là bắt buộc';
    }

    if (!formData.class) {
      newErrors.class = 'Lớp học là bắt buộc';
    }

    // Chỉ validate parentId khi thêm mới
    if (mode === 'add') {
      if (!formData.parentId) {
        newErrors.parentId = 'Phụ huynh là bắt buộc';
      }
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 6 || age > 18) {
        newErrors.dateOfBirth = 'Tuổi học sinh phải từ 6 đến 18';
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Chỉ xử lý parentId khi mode là 'add'
    if (name === 'parentId' && mode === 'add') {
      const selectedParent = mockParents.find(p => p.id.toString() === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        parentName: selectedParent ? selectedParent.name : '',
        address: selectedParent ? selectedParent.address : prev.address
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
          placeholder="Nhập họ và tên học sinh"
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Mã học sinh"
          name="studentCode"
          value={formData.studentCode}
          onChange={handleChange}
          error={errors.studentCode}
          placeholder="Nhập mã học sinh"
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Lớp học"
          name="class"
          type="select"
          value={formData.class}
          onChange={handleChange}
          error={errors.class}
          options={classes.map(cls => ({ value: cls, label: cls }))}
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Ngày sinh"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          error={errors.dateOfBirth}
          required
          readOnly={isReadOnly}
        />

  
        <FormInput
          label="Phụ huynh"
          name="parentId"
          type={mode === 'add' ? 'select' : 'text'}
          value={mode === 'add' ? formData.parentId : formData.parentName}
          onChange={handleChange}
          error={errors.parentId}
          options={mode === 'add' ? mockParents.filter(p => p.status === 'active').map(parent => ({
            value: parent.id,
            label: `${parent.name} - ${parent.phone}`
          })) : undefined}
          required
          readOnly={mode !== 'add'}
          placeholder={mode === 'add' ? 'Chọn phụ huynh' : undefined}
        />
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

export default StudentForm;