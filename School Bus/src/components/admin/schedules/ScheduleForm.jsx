import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { driversService } from '../../../services/driversService';
import { busesService } from '../../../services/busesService';
import { routesService } from '../../../services/routesService';

const ScheduleForm = ({ schedule, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    driver_id: '',
    bus_id: '',
    route_id: '',
    date: '',
    shift_type: '',
    start_time: '',
    end_time: '',
    student_count: 0,
    status: 'scheduled',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  // Load dữ liệu dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversData, busesData, routesData] = await Promise.all([
          driversService.getAllDrivers(),
          busesService.getAllBuses(),
          routesService.getAllRoutes()
        ]);
        setDrivers(driversData || []);
        setBuses(busesData || []);
        setRoutes(routesData || []);
        setOptionsLoaded(true);
      } catch (error) {
        console.error(' Error fetching data:', error);
      }
    };
    fetchData();
  }, []);


  // Gán dữ liệu khi edit/view: lấy từ prop `schedule` (cha truyền xuống)
  useEffect(() => {
    if (schedule && optionsLoaded) {
      setFormData({
  
  driver_id: (schedule.driver_id !== undefined && schedule.driver_id !== null) ? String(schedule.driver_id) : '',
  bus_id: (schedule.bus_id !== undefined && schedule.bus_id !== null) ? String(schedule.bus_id) : '',
  route_id: (schedule.route_id !== undefined && schedule.route_id !== null) ? String(schedule.route_id) : '',
        date: schedule.date || '',
        shift_type: schedule.shift_type || '',
        start_time: schedule.start_time || schedule.scheduled_start_time || '',
        end_time: schedule.end_time || schedule.scheduled_end_time || '',
  student_count: (schedule.student_count !== undefined && schedule.student_count !== null) ? Number(schedule.student_count) : 0,
        status: schedule.status || 'scheduled',
        notes: schedule.notes || '',
      });
    }
  }, [schedule, optionsLoaded]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.driver_id) newErrors.driver_id = 'Tài xế là bắt buộc';
    if (!formData.bus_id) newErrors.bus_id = 'Xe buýt là bắt buộc';
    if (!formData.route_id) newErrors.route_id = 'Tuyến đường là bắt buộc';
    if (!formData.date) newErrors.date = 'Ngày là bắt buộc';
    if (!formData.shift_type) newErrors.shift_type = 'Loại ca là bắt buộc';
    if (!formData.start_time) newErrors.start_time = 'Giờ bắt đầu là bắt buộc';
    if (!formData.end_time) newErrors.end_time = 'Giờ kết thúc là bắt buộc';

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = 'Giờ kết thúc phải sau giờ bắt đầu';
    }

    if (formData.student_count < 0) {
      newErrors.student_count = 'Số học sinh không thể âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newVal = value;
    // normalize certain fields
    if (name === 'student_count') {
      newVal = value === '' ? 0 : Number(value);
    } else if (name.endsWith('_id')) {
      // keep IDs as strings so they match option values from the DOM
      newVal = value ? String(value) : '';
    }

    setFormData(prev => ({ ...prev, [name]: newVal }));
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
        // convert ID strings back to numbers for the API payload
        const payload = {
          ...formData,
          driver_id: formData.driver_id ? Number(formData.driver_id) : null,
          bus_id: formData.bus_id ? Number(formData.bus_id) : null,
          route_id: formData.route_id ? Number(formData.route_id) : null,
          student_count: Number(formData.student_count) || 0,
        };
        await onSubmit(payload);
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
          label="Tài xế"
          name="driver_id"
          type="select"
          value={formData.driver_id}
          onChange={handleChange}
          error={errors.driver_id}
          options={drivers.map(d => ({ value: d.id, label: d.name }))}
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Xe buýt"
          name="bus_id"
          type="select"
          value={formData.bus_id}
          onChange={handleChange}
          error={errors.bus_id}
          options={buses.map(b => ({ value: b.id, label: b.license_plate }))}
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Tuyến đường"
          name="route_id"
          type="select"
          value={formData.route_id}
          onChange={handleChange}
          error={errors.route_id}
          options={routes.map(r => ({ value: r.id, label: r.route_name }))}
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Ngày"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Loại ca"
          name="shift_type"
          type="select"
          value={formData.shift_type}
          onChange={handleChange}
          error={errors.shift_type}
          options={[
            { value: 'morning', label: 'Ca sáng' },
            { value: 'afternoon', label: 'Ca chiều' },
            { value: 'evening', label: 'Ca tối' },
          ]}
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Giờ bắt đầu"
          name="start_time"
          type="time"
          value={formData.start_time}
          onChange={handleChange}
          error={errors.start_time}
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Giờ kết thúc"
          name="end_time"
          type="time"
          value={formData.end_time}
          onChange={handleChange}
          error={errors.end_time}
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Số học sinh"
          name="student_count"
          type="number"
          value={formData.student_count}
          onChange={handleChange}
          error={errors.student_count}
          min="0"
          readOnly={isReadOnly}
        />

        <FormInput
          label="Trạng thái"
          name="status"
          type="select"
          value={formData.status}
          onChange={handleChange}
          error={errors.status}
          options={[
            { value: 'scheduled', label: 'Đã lên lịch' },
            { value: 'in_progress', label: 'Đang thực hiện' },
            { value: 'completed', label: 'Hoàn thành' },
            { value: 'cancelled', label: 'Đã hủy' },
          ]}
          readOnly={isReadOnly}
        />
      </div>

      {/* Ghi chú full width */}
      <div className="mt-4">
        <FormInput
          label="Ghi chú"
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={handleChange}
          error={errors.notes}
          rows={3}
          readOnly={isReadOnly}
        />
      </div>

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

ScheduleForm.propTypes = {
  schedule: PropTypes.object,
  mode: PropTypes.oneOf(['add', 'edit', 'view']).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ScheduleForm;
