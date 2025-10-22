import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { parentsService } from '../../../services/parentsService';
import { classesService } from '../../../services/classesService';

const StudentForm = ({ student, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    class: '',
    parent_id: '',
    phone: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Load parents and classes for dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parentsData, classesData] = await Promise.all([
          parentsService.getAllParents(),
          classesService.getAllClasses()
        ]);
        console.log('📚 Loaded classes:', classesData); // Debug log
        console.log('👨‍👩‍👧 Loaded parents:', parentsData); // Debug log
        setParents(parentsData || []);
        setClasses(classesData || []);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        // Set empty arrays nếu lỗi để tránh undefined
        setParents([]);
        setClasses([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (student) {
      console.log('🎯 Setting form data with student:', student);
      setFormData({
        name: student.name || '',
        grade: student.grade || '',
        class: student.class_name || student.class || '', // Ưu tiên class_name từ API
        parent_id: student.parent_id || '',
        phone: student.phone || '',
        address: student.address || ''
      });
    }
  }, [student]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên là bắt buộc';
    }

    if (!formData.grade.trim()) {
      newErrors.grade = 'Khối là bắt buộc';
    } else {
      // Kiểm tra grade có tồn tại trong database không
      const availableGrades = [...new Set(classes.map(cls => cls.grade))];
      if (!availableGrades.includes(formData.grade)) {
        newErrors.grade = `Khối ${formData.grade} không tồn tại. Chỉ có khối: ${availableGrades.join(', ')}`;
      }
    }

    if (!formData.class.trim()) {
      newErrors.class = 'Lớp học là bắt buộc';
    } else {
      // Kiểm tra class có tồn tại trong database không
      const classExists = classes.some(cls => cls.class_name === formData.class);
      if (!classExists) {
        newErrors.class = 'Lớp này không tồn tại trong hệ thống';
      }
      
      // Kiểm tra grade và class có match nhau không
      if (formData.grade && classExists) {
        const selectedClass = classes.find(cls => cls.class_name === formData.class);
        if (selectedClass && selectedClass.grade !== formData.grade) {
          newErrors.grade = `Khối ${formData.grade} không khớp với lớp ${formData.class} (khối ${selectedClass.grade})`;
        }
      }
    }

    if (mode === 'add' && !formData.parent_id) {
      newErrors.parent_id = 'Phụ huynh là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-fill grade when class is selected
    if (name === 'class' && value && classes.length > 0) {
      const selectedClass = classes.find(cls => cls.class_name === value);
      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          grade: selectedClass.grade // Tự động điền khối từ lớp được chọn
        }));
        
        // Clear both class and grade errors
        if (errors[name] || errors.grade) {
          setErrors(prev => ({
            ...prev,
            [name]: '',
            grade: ''
          }));
        }
        return;
      }
    }
    
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

  // Log để debug
  console.log('🔍 Current state:', { 
    classes: classes?.length, 
    parents: parents?.length,
    formData 
  });

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
          label="Khối"
          name="grade"
          type="select"
          value={formData.grade}
          onChange={handleChange}
          error={errors.grade}
          options={[
            { value: '', label: 'Chọn khối' },
            ...[...new Set(classes.map(cls => cls.grade))]
              .sort()
              .map(grade => ({ value: grade, label: `Khối ${grade}` }))
          ]}
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
          placeholder="Chọn lớp học"
          options={(classes || []).map(cls => ({ 
            value: cls.class_name, 
            label: `${cls.class_name} (Khối ${cls.grade})` 
          }))}
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Phụ huynh"
          name="parent_id"
          type="select"
          value={formData.parent_id}
          onChange={handleChange}
          error={errors.parent_id}
          placeholder="Chọn phụ huynh"
          options={(parents || []).map(parent => ({
            value: parent.id,
            label: `${parent.name} - ${parent.phone || 'N/A'}`
          }))}
          required={mode === 'add'}
          readOnly={mode === 'view'}
        />

        <FormInput
          label="Số điện thoại"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="Nhập số điện thoại"
          readOnly={isReadOnly}
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

StudentForm.propTypes = {
  student: PropTypes.object,
  mode: PropTypes.oneOf(['add', 'edit', 'view']).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default StudentForm;