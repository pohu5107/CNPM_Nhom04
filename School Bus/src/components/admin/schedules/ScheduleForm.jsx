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
    shift_number: '',
    start_time: '',
    end_time: '',
    start_point: '',
    end_point: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

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
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Gán dữ liệu khi edit/view
  useEffect(() => {
    if (schedule) {
      setFormData({
        driver_id: schedule.driver_id || '',
        bus_id: schedule.bus_id || '',
        route_id: schedule.route_id || '',
        date: schedule.date || '',
        shift_type: schedule.shift_type || '',
        shift_number: schedule.shift_number || '',
        start_time: schedule.start_time || '',
        end_time: schedule.end_time || '',
        start_point: schedule.start_point || '',
        end_point: schedule.end_point || '',
      });
    }
  }, [schedule]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.driver_id) newErrors.driver_id = 'Tài xế là bắt buộc';
    if (!formData.bus_id) newErrors.bus_id = 'Xe buýt là bắt buộc';
    if (!formData.route_id) newErrors.route_id = 'Tuyến đường là bắt buộc';
    if (!formData.date) newErrors.date = 'Ngày là bắt buộc';
    if (!formData.shift_type) newErrors.shift_type = 'Loại ca là bắt buộc';
    if (!formData.shift_number) newErrors.shift_number = 'Số ca là bắt buộc';
    if (!formData.start_time) newErrors.start_time = 'Giờ bắt đầu là bắt buộc';
    if (!formData.end_time) newErrors.end_time = 'Giờ kết thúc là bắt buộc';
    if (!formData.start_point) newErrors.start_point = 'Điểm đầu là bắt buộc';
    if (!formData.end_point) newErrors.end_point = 'Điểm cuối là bắt buộc';

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = 'Giờ kết thúc phải sau giờ bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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
          label="Số ca"
          name="shift_number"
          type="number"
          value={formData.shift_number}
          onChange={handleChange}
          error={errors.shift_number}
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
          label="Điểm đầu"
          name="start_point"
          type="text"
          value={formData.start_point}
          onChange={handleChange}
          error={errors.start_point}
          required
          readOnly={isReadOnly}
        />

        <FormInput
          label="Điểm cuối"
          name="end_point"
          type="text"
          value={formData.end_point}
          onChange={handleChange}
          error={errors.end_point}
          required
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
