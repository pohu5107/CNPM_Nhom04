import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { parentsService } from '../../../services/parentsService';
import { classesService } from '../../../services/classesService';
import { routesService } from '../../../services/routesService';

const StudentForm = ({ student, mode, onSubmit, onCancel }) => {
  
  const [formData, setFormData] = useState({
    name: '', grade: '', class: '', parent_id: '', phone: '', address: '',
    morning_route_id: '', morning_pickup_stop_id: '', afternoon_route_id: '', afternoon_dropoff_stop_id: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  

  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [morningRouteStops, setMorningRouteStops] = useState([]);
  const [afternoonRouteStops, setAfternoonRouteStops] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parentsData, classesData, routesData] = await Promise.all([
          parentsService.getAllParents(),
          classesService.getAllClasses(), 
          routesService.getAllRoutes()
        ]);
        setParents(parentsData || []);
        setClasses(classesData || []);
        setAllRoutes(routesData || []);
      } catch (error) {
       
        setParents([]);
        setClasses([]);
        setAllRoutes([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!student) return;
    
    setFormData({
      name: student.name || '', grade: student.grade || '', class: student.class_name || student.class || '',
      parent_id: student.parent_id || '', phone: student.phone || '', address: student.address || '',
      morning_route_id: student.morning_route_id || '', morning_pickup_stop_id: student.morning_pickup_stop_id || '',
      afternoon_route_id: student.afternoon_route_id || '', afternoon_dropoff_stop_id: student.afternoon_dropoff_stop_id || ''
    });

 
  const loadStops = async (routeId, setStops) => {
      if (!routeId) return;
      try {
        const stops = await routesService.getRouteStops(routeId);
        setStops(stops || []);
      } catch (err) {
      
        setStops([]);
      }
    };
    
    loadStops(student.morning_route_id, setMorningRouteStops);
    loadStops(student.afternoon_route_id, setAfternoonRouteStops);
  }, [student]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Họ tên là bắt buộc';
    if (!formData.address.trim()) newErrors.address = 'Địa chỉ là bắt buộc';
    if (mode === 'add' && !formData.parent_id) newErrors.parent_id = 'Phụ huynh là bắt buộc';


    const availableGrades = [...new Set(classes.map(cls => cls.grade))];
    if (!formData.grade.trim()) {
      newErrors.grade = 'Khối là bắt buộc';
    } else if (!availableGrades.includes(formData.grade)) {
      newErrors.grade = `Khối không hợp lệ. Có: ${availableGrades.join(', ')}`;
    }


    const selectedClass = classes.find(cls => cls.class_name === formData.class);
    if (!formData.class.trim()) {
      newErrors.class = 'Lớp học là bắt buộc';
    } else if (!selectedClass) {
      newErrors.class = 'Lớp không tồn tại';
    } else if (selectedClass.grade !== formData.grade) {
      newErrors.grade = `Lớp ${formData.class} thuộc khối ${selectedClass.grade}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Hàm trợ giúp: tải điểm dừng cho tuyến (sử dụng khi người dùng thay đổi select tuyến)
 
  const loadRouteStops = async (routeId, setStops) => {
    if (!routeId) {
      setStops([]);
      return;
    }
    try {
      const stops = await routesService.getRouteStops(routeId);
      setStops(stops || []);
    } catch (err) {
     
      setStops([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;


    if (name === 'class' && value) {
      const selectedClass = classes.find(cls => cls.class_name === value);
      if (selectedClass) {
        setFormData(prev => ({ ...prev, class: value, grade: selectedClass.grade }));
        setErrors(prev => ({ ...prev, class: '', grade: '' }));
        return;
      }
    }


    if (name === 'morning_route_id') {
      setFormData(prev => ({ ...prev, morning_route_id: value, morning_pickup_stop_id: '' }));
      loadRouteStops(value, setMorningRouteStops);
      setErrors(prev => ({ ...prev, morning_route_id: '', morning_pickup_stop_id: '' }));
      return;
    }
    
    if (name === 'afternoon_route_id') {
      setFormData(prev => ({ ...prev, afternoon_route_id: value, afternoon_dropoff_stop_id: '' }));
      loadRouteStops(value, setAfternoonRouteStops);
      setErrors(prev => ({ ...prev, afternoon_route_id: '', afternoon_dropoff_stop_id: '' }));
      return;
    }
    
  // Cập nhật giá trị trường mặc định (những input thông thường)
  // Đồng thời clear lỗi tương ứng nếu có.
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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

  // isReadOnly dùng để disable/readonly các input khi component được dùng chỉ để xem
  const isReadOnly = mode === 'view';


  

if (mode === 'view' && student) {
  //  Lấy tên Tuyến đường
  const morningRouteName = student.morning_route_name || '';
  const afternoonRouteName = student.afternoon_route_name || '';

  //  Tìm tên Điểm Đón/Trả dựa vào ID
  // Duyệt mảng stops -> Tìm stop có ID trùng với ID trong hồ sơ HS -> Lấy tên -> Nếu không thấy thì trả về rỗng.

  const morningPickupName = (morningRouteStops.find(s => String(s.stop_id) === String(student.morning_pickup_stop_id))?.name) || '';
  const afternoonDropoffName = (afternoonRouteStops.find(s => String(s.stop_id) === String(student.afternoon_dropoff_stop_id))?.name)|| '';
  
  // Tìm tên Trường học 
  // stop_order 99 là trường buổi sáng, stop_order 0 là trường buổi chiều
  const morningSchoolName = morningRouteStops.find(s => Number(s.stop_order) === 99)?.name || '';
  const afternoonSchoolName = afternoonRouteStops.find(s => Number(s.stop_order) === 0)?.name || '';

  return (
      <div className="space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">{(student.name||'').slice(-1).charAt(0) || ''}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{student.name}</h3>
                <p className="text-sm text-gray-600">Mã học sinh: #{student.id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-700">Lớp {student.class_name || student.class}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">Khối {student.grade}</span>
                </div>
              </div>
            </div>
            <div className={`px-3 py-2 rounded-full text-sm font-medium ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {student.status === 'active' ? 'Đang học' : 'Nghỉ học'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h4 className="text-lg font-semibold mb-3">Thông tin liên hệ</h4>
              <div className="text-sm text-gray-800">SĐT: {student.phone || student.student_phone || 'Chưa có'}</div>
              <div className="text-sm text-gray-800 mt-2">Địa chỉ: {student.address || 'Chưa có'}</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h4 className="text-lg font-semibold mb-3">Thông tin phụ huynh</h4>
              <div className="text-sm text-gray-800">Họ tên: {student.parent_name || 'Chưa có'}</div>
              <div className="text-sm text-gray-800">Quan hệ: {student.relationship || 'Chưa có'}</div>
              <div className="text-sm text-gray-800">SĐT: {student.parent_phone || 'Chưa có'}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h4 className="text-lg font-semibold mb-3">Thông tin tuyến xe</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">Tuyến đi </div>
                  <div className="font-medium text-gray-800">{morningRouteName || 'Chưa phân tuyến'}</div>
                  <div className="text-sm text-gray-600 mt-2">Điểm đón</div>
                  <div className="text-sm text-gray-800">{morningPickupName || 'Chưa có'}</div>
                   <div className="text-sm text-gray-600 mt-2">Kết thúc:</div>
                  <div className="text-xs text-gray-500 mt-1 ">{morningSchoolName}</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">Tuyến về </div>
                  <div className="font-medium text-gray-800">{afternoonRouteName || 'Chưa phân tuyến'}</div>
                  <div className="text-sm text-gray-600 mt-2">Bắt đầu:</div>
                  <div className="text-xs text-gray-500 mt-1 ">{afternoonSchoolName}</div>
                  <div className="text-sm text-gray-600 mt-2">Điểm trả</div>
                  <div className="text-sm text-gray-800">{afternoonDropoffName || 'Chưa có'}</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">

          <Button variant="secondary" onClick={onCancel}>Đóng</Button>
        </div>
      </div>
    );
  }
  
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

        <FormInput
          label="Tuyến đi (Sáng)"
          name="morning_route_id"
          type="select"
          value={formData.morning_route_id}
          onChange={handleChange}
          error={errors.morning_route_id}
          options={[{ value: '', label: 'Chọn tuyến đi' }, ...(allRoutes || []).map(r => ({ value: r.id, label: r.route_name || r.name || `Tuyến ${r.id}` }))]}
          readOnly={isReadOnly}
        />

        <FormInput
          label="Điểm đón (Sáng)"
          name="morning_pickup_stop_id"
          type="select"
          value={formData.morning_pickup_stop_id}
          onChange={handleChange}
          error={errors.morning_pickup_stop_id}
          options={[
            { value: '', label: 'Chọn điểm đón' }, 
            ...(morningRouteStops || [])
              .filter(s => s.stop_order !== 0 && s.stop_order !== 99)
              .map(s => ({ 
                value: s.stop_id, 
                label: `${s.name} - ${s.address}` 
              }))
          ]}
          readOnly={isReadOnly}
          disabled={!formData.morning_route_id}
        />

        <FormInput
          label="Tuyến về (Chiều)"
          name="afternoon_route_id"
          type="select"
          value={formData.afternoon_route_id}
          onChange={handleChange}
          error={errors.afternoon_route_id}
          options={[{ value: '', label: 'Chọn tuyến về' }, ...(allRoutes || []).map(r => ({ value: r.id, label: r.route_name || r.name || `Tuyến ${r.id}` }))]}
          readOnly={isReadOnly}
        />

        <FormInput
          label="Điểm trả (Chiều)" 
          name="afternoon_dropoff_stop_id"
          type="select"
          value={formData.afternoon_dropoff_stop_id}
          onChange={handleChange}
          error={errors.afternoon_dropoff_stop_id}
          options={[
            { value: '', label: 'Chọn điểm trả' },
            ...(afternoonRouteStops || [])
              .filter(s => s.stop_order !== 0 && s.stop_order !== 99)
              .map(s => ({ 
                value: s.stop_id, 
                label: `${s.name} - ${s.address}` 
              }))
          ]}
          readOnly={isReadOnly}
          disabled={!formData.afternoon_route_id}
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