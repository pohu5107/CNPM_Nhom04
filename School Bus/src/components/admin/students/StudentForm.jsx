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
      <div className="space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Student Basic Info Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">
                  {student.name.split(' ').slice(-1)[0].charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                <p className="text-sm text-gray-600">Mã học sinh: #{student.id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-700">Lớp {student.class_name || student.class}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">Khối {student.grade}</span>
                  {student.homeroom_teacher && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">GVCN: {student.homeroom_teacher}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className={`px-3 py-2 rounded-full text-sm font-medium ${
              student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {student.status === 'active' ? 'Đang học' : 'Nghỉ học'}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Contact & Parent Info */}
          <div className="space-y-4">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  📞
                </span>
                Thông tin liên hệ
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">SĐT học sinh</span>
                  <span className="text-sm text-gray-800 font-medium">{student.phone || student.student_phone || 'Chưa có'}</span>
                </div>
                <div className="py-2">
                  <span className="text-sm font-medium text-gray-500 block mb-1">Địa chỉ</span>
                  <p className="text-sm text-gray-800">{student.address || 'Chưa có'}</p>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  👨‍👩‍👧
                </span>
                Thông tin phụ huynh
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Họ tên</span>
                  <span className="text-sm text-gray-800 font-medium">{student.parent_name || 'Chưa có'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Mối quan hệ</span>
                  <span className="text-sm text-gray-800 font-medium">{student.relationship || 'Chưa có'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-500">SĐT phụ huynh</span>
                  <span className="text-sm text-gray-800 font-medium">{student.parent_phone || 'Chưa có'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Transportation Info */}
          <div className="space-y-4">
            {(student.route_name || student.bus_number) ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    🚌
                  </span>
                  Thông tin xe buýt
                </h4>
                
                {/* Route & Bus Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">{student.route_name || 'Chưa có'}</div>
                      <div className="text-xs text-gray-500 mt-1">Tuyến đường</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">{student.bus_number || 'Chưa có'}</div>
                      <div className="text-xs text-gray-500 mt-1">Số xe</div>
                      {student.license_plate && (
                        <div className="text-xs text-gray-600 mt-1 font-mono">{student.license_plate}</div>
                      )}
                    </div>
                  </div>

                  {/* Schedule Times */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">
                        {student.schedule_start_time ? 
                          student.schedule_start_time.substring(0,5) : 
                          'Chưa có'
                        }
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Giờ đón</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-800">
                        {student.schedule_end_time ? 
                          student.schedule_end_time.substring(0,5) : 
                          'Chưa có'
                        }
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Giờ trả</div>
                    </div>
                  </div>

                  {/* Route Points */}
                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span className="text-sm font-medium text-green-700">Điểm đón</span>
                      </div>
                      <p className="text-sm text-gray-800 pl-5">
                        {student.schedule_start_point || 'Chưa có thông tin'}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span className="text-sm font-medium text-red-700">Điểm trả</span>
                      </div>
                      <p className="text-sm text-gray-800 pl-5">
                        {student.schedule_end_point || 'Chưa có thông tin'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    �
                  </div>
                  <p className="text-gray-600">Chưa có thông tin xe buýt</p>
                  <p className="text-sm text-gray-500 mt-1">Học sinh chưa được phân xe</p>
                </div>
              </div>
            )}
          </div>
        </div>

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