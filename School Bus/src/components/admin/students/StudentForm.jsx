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

  // Render detailed view for student information
  if (mode === 'view' && student) {
    return (
      <div className="space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Student Basic Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">
                {student.name.split(' ').slice(-1)[0].charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{student.name}</h3>
              <p className="text-sm text-gray-600">Mã học sinh: #{student.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{student.grade}</div>
              <div className="text-xs text-gray-500">Khối</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-800">{student.class_name || student.class}</div>
              <div className="text-xs text-gray-500">Lớp học</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-800">{student.homeroom_teacher || 'Chưa có'}</div>
              <div className="text-xs text-gray-500">GVCN</div>
            </div>
            <div className="text-center">
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {student.status === 'active' ? 'Đang học' : 'Nghỉ học'}
              </div>
              <div className="text-xs text-gray-500">Trạng thái</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2 text-xs">
                📞
              </span>
              Thông tin liên hệ
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-500">SĐT học sinh</label>
                <p className="text-sm text-gray-800">{student.phone || student.student_phone || 'Chưa có'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Địa chỉ</label>
                <p className="text-sm text-gray-800">{student.address || 'Chưa có'}</p>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-xs">
                👨‍👩‍👧
              </span>
              Thông tin phụ huynh
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-500">Họ tên</label>
                <p className="text-sm text-gray-800">{student.parent_name || 'Chưa có'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Mối quan hệ</label>
                <p className="text-sm text-gray-800">{student.relationship || 'Chưa có'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">SĐT phụ huynh</label>
                <p className="text-sm text-gray-800">{student.parent_phone || 'Chưa có'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transportation Info */}
        {(student.route_name || student.bus_number) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-2 text-xs">
                🚌
              </span>
              Thông tin xe buýt
            </h4>
            
            {/* Transportation Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="text-center bg-orange-50 rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-800">{student.route_name || 'Chưa có'}</div>
                <div className="text-xs text-gray-500">Tuyến đường</div>
              </div>
              <div className="text-center bg-blue-50 rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-800">{student.bus_number || 'Chưa có'}</div>
                <div className="text-xs text-gray-500">Số xe</div>
              </div>
              <div className="text-center bg-green-50 rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-800">
                  {student.schedule_start_time ? 
                    student.schedule_start_time.substring(0,5) : 
                    'Chưa có lịch'
                  }
                </div>
                <div className="text-xs text-gray-500">Giờ đón (theo lịch)</div>
              </div>
              <div className="text-center bg-purple-50 rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-800">
                  {student.schedule_end_time ? 
                    student.schedule_end_time.substring(0,5) : 
                    'Chưa có lịch'
                  }
                </div>
                <div className="text-xs text-gray-500">Giờ trả (theo lịch)</div>
              </div>
            </div>

            {/* Route Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                  <span className="text-xs font-medium text-green-700">Điểm đón</span>
                </div>
                <p className="text-sm text-gray-800 font-medium">
                  {student.schedule_start_point || 'Chưa có thông tin'}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                  <span className="text-xs font-medium text-red-700">Điểm trả</span>
                </div>
                <p className="text-sm text-gray-800 font-medium">
                  {student.schedule_end_point || 'Chưa có thông tin'}
                </p>
              </div>
            </div>

            {/* License Plate */}
            {student.license_plate && (
              <div className="text-center">
                <span className="inline-block bg-gray-100 px-3 py-2 rounded-lg font-mono text-sm font-bold text-gray-800">
                  🚗 {student.license_plate}
                </span>
                <div className="text-xs text-gray-500 mt-1">Biển số xe</div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onCancel}>
            Đóng
          </Button>
        </div>
      </div>
    );
  }

  // Regular form for add/edit modes
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