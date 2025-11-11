import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { parentsService } from '../../../services/parentsService';
import { classesService } from '../../../services/classesService';
import { routesService } from '../../../services/routesService';

const StudentForm = ({ student, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    class: '',
    parent_id: '',
    phone: '',
    address: '',
    morning_route_id: '',
    morning_pickup_stop_id: '',
    afternoon_route_id: '',
    afternoon_dropoff_stop_id: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [routeStops, setRouteStops] = useState([]);
  const [afternoonRouteStops, setAfternoonRouteStops] = useState([]); // stops for selected route

  // Load parents and classes for dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parentsData, classesData] = await Promise.all([
          parentsService.getAllParents(),
          classesService.getAllClasses()
        ]);
      
        setParents(parentsData || []);
        setClasses(classesData || []);
        // Load all routes for assignment dropdowns
        try {
          const routes = await routesService.getAllRoutes();
          setAllRoutes(routes || []);
        } catch (rErr) {
          console.warn('Could not load routes for student form', rErr);
          setAllRoutes([]);
        }
      } catch (error) {
        console.error(' Error fetching data:', error);
        // Set empty arrays nếu lỗi để tránh undefined
        setParents([]);
        setClasses([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (student) {
      console.log(' Setting form data with student:', student);
      setFormData({
        name: student.name || '',
        grade: student.grade || '',
        class: student.class_name || student.class || '', 
        parent_id: student.parent_id || '',
        phone: student.phone || '',
        address: student.address || '',
        morning_route_id: student.morning_route_id || '',
        morning_pickup_stop_id: student.morning_pickup_stop_id || '',
        afternoon_route_id: student.afternoon_route_id || '',
        afternoon_dropoff_stop_id: student.afternoon_dropoff_stop_id || ''
      });

     
      (async () => {
        // Load morning route stops
        if (student.morning_route_id) {
          try {
            const stopsData = await routesService.getRouteStops(student.morning_route_id);
            setRouteStops(stopsData || []);
          } catch (err) {
            console.warn('Could not fetch morning route stops for student', err);
            setRouteStops([]);
          }
        } else {
          setRouteStops([]);
        }

        // Load afternoon route stops and auto-set dropoff to last stop (prefer stop_order === 99)
        if (student.afternoon_route_id) {
          try {
            const stopsData = await routesService.getRouteStops(student.afternoon_route_id);
            const stops = stopsData || [];
            setAfternoonRouteStops(stops);

        
            let lastStop = stops.find(s => Number(s.stop_order) === 99);
            if (!lastStop && stops.length > 0) {
              lastStop = stops.reduce((acc, cur) => {
                return (Number(cur.stop_order) > Number(acc.stop_order)) ? cur : acc;
              }, stops[0]);
            }

            if (lastStop) {
              setFormData(prev => ({ ...prev, afternoon_dropoff_stop_id: lastStop.stop_id }));
            }
          } catch (err) {
            console.warn('Could not fetch afternoon route stops for student', err);
            setAfternoonRouteStops([]);
          }
        } else {
          setAfternoonRouteStops([]);
        }
      })();
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
    

    if (name === 'class' && value && classes.length > 0) {
      const selectedClass = classes.find(cls => cls.class_name === value);
      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          grade: selectedClass.grade // Tự động điền khối từ lớp được chọn
        }));
        

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
    

    if (name === 'morning_route_id') {
      const routeId = value;
 
      setFormData(prev => ({ ...prev, morning_route_id: routeId, morning_pickup_stop_id: '' }));
      if (routeId) {
        (async () => {
          try {
            const stopsData = await routesService.getRouteStops(routeId);
            setRouteStops(stopsData || []);
          } catch (err) {
            console.warn('Could not load stops for route', err);
            setRouteStops([]);
          }
        })();
      } else {
        setRouteStops([]);
      }
      // clear errors related
      if (errors.morning_route_id || errors.morning_pickup_stop_id) {
        setErrors(prev => ({ ...prev, morning_route_id: '', morning_pickup_stop_id: '' }));
      }
      return;
    }

    // When selecting afternoon route, load its stops  
    if (name === 'afternoon_route_id') {
      const routeId = value;

      setFormData(prev => ({ ...prev, afternoon_route_id: routeId, afternoon_dropoff_stop_id: '' }));
      if (routeId) {
        (async () => {
          try {
            const stopsData = await routesService.getRouteStops(routeId);
            const stops = stopsData || [];
            setAfternoonRouteStops(stops);

       
            let lastStop = stops.find(s => Number(s.stop_order) === 99);
            if (!lastStop && stops.length > 0) {
              lastStop = stops.reduce((acc, cur) => {
                return (Number(cur.stop_order) > Number(acc.stop_order)) ? cur : acc;
              }, stops[0]);
            }

            if (lastStop) {

              setFormData(prev => ({ ...prev, afternoon_dropoff_stop_id: lastStop.stop_id }));
            }
          } catch (err) {
            console.warn('Could not load stops for afternoon route', err);
            setAfternoonRouteStops([]);
          }
        })();
      } else {
        setAfternoonRouteStops([]);
      }
      // clear errors related
      if (errors.afternoon_route_id || errors.afternoon_dropoff_stop_id) {
        setErrors(prev => ({ ...prev, afternoon_route_id: '', afternoon_dropoff_stop_id: '' }));
      }
      return;
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


  // Render detailed view for student information
  if (mode === 'view' && student) {
    // derive names from loaded route stops / routes if available
    const morningRouteName = student.morning_route_name || (allRoutes.find(r => String(r.id) === String(student.morning_route_id))?.route_name) || '';
    const afternoonRouteName = student.afternoon_route_name || (allRoutes.find(r => String(r.id) === String(student.afternoon_route_id))?.route_name) || '';
    const morningPickupName = (routeStops.find(s => String(s.stop_id) === String(student.morning_pickup_stop_id))?.name) || student.morning_pickup_stop_name || '';
    const afternoonDropoffName = (afternoonRouteStops.find(s => String(s.stop_id) === String(student.afternoon_dropoff_stop_id))?.name) || student.afternoon_dropoff_stop_name || '';

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
              <h4 className="text-lg font-semibold mb-3">Tuyến & Điểm</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">Tuyến đón (Sáng)</div>
                  <div className="font-medium text-gray-800">{morningRouteName || 'Chưa phân tuyến'}</div>
                  <div className="text-sm text-gray-600 mt-2">Điểm đón</div>
                  <div className="text-sm text-gray-800">{morningPickupName || 'Chưa có'}</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-sm text-gray-600">Tuyến trả (Chiều)</div>
                  <div className="font-medium text-gray-800">{afternoonRouteName || 'Chưa phân tuyến'}</div>
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
          label="Tuyến đón (Sáng)"
          name="morning_route_id"
          type="select"
          value={formData.morning_route_id}
          onChange={handleChange}
          error={errors.morning_route_id}
          options={[{ value: '', label: 'Chọn tuyến' }, ...(allRoutes || []).map(r => ({ value: r.id, label: r.route_name || r.name || `Tuyến ${r.id}` }))]}
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
            ...(routeStops || [])
              .filter(s => s.stop_order !== 0 && s.stop_order !== 99) 
              .map(s => ({ 
                value: s.stop_id, 
                label: `${s.name} - ${s.address}` 
              }))
          ]}
          readOnly={isReadOnly}
        />

        <FormInput
          label="Tuyến trả (Chiều)"
          name="afternoon_route_id"
          type="select"
          value={formData.afternoon_route_id}
          onChange={handleChange}
          error={errors.afternoon_route_id}
          options={[{ value: '', label: 'Chọn tuyến' }, ...(allRoutes || []).map(r => ({ value: r.id, label: r.route_name || r.name || `Tuyến ${r.id}` }))]}
          readOnly={isReadOnly}
        />

        <FormInput
          label="Điểm trả (Chiều)"
          name="afternoon_dropoff_stop_id"
          type="select"
          value={formData.afternoon_dropoff_stop_id}
          onChange={handleChange}
          error={errors.afternoon_dropoff_stop_id}
          options={(() => {
            const stops = afternoonRouteStops || [];
            if (stops.length === 0) return [{ value: '', label: 'Chọn điểm trả' }];
        
            let lastStop = stops.find(s => Number(s.stop_order) === 99);
            if (!lastStop) {
              lastStop = stops.reduce((acc, cur) => (Number(cur.stop_order) > Number(acc.stop_order) ? cur : acc), stops[0]);
            }
            if (!lastStop) return [{ value: '', label: 'Chọn điểm trả' }];
            return [{ value: lastStop.stop_id, label: `${lastStop.name} - ${lastStop.address}` }];
          })()}

          readOnly={true}
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