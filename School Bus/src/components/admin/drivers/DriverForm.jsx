import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';


const DriverForm = ({ driver, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    license_number: '',
    address: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        phone: driver.phone || '',
        license_number: driver.license_number || '',
        address: driver.address || '',
        status: driver.status || 'active'
      });
      // Set first date as default
      if (driver.schedules && driver.schedules.length > 0) {
        const dates = [...new Set(driver.schedules.map(s => s.date))].sort().reverse();
        setSelectedDate(dates[0]);
      }
    }
  }, [driver]);

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

    if (mode === 'add' && !formData.license_number.trim()) {
      newErrors.license_number = 'Số bằng lái là bắt buộc';
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
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormInput
            label="Họ và tên"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Nhập họ và tên tài xế"
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
            label="Số bằng lái"
            name="license_number"
            value={formData.license_number}
            onChange={handleChange}
            error={errors.license_number}
            placeholder="Nhập số bằng lái xe"
            required={mode === 'add'}
            readOnly={isReadOnly || mode === 'edit'}
          />

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

        {/* Thông tin lịch trình cơ bản - chỉ hiển thị khi view */}
        {mode === 'view' && driver?.schedules && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">Lịch trình làm việc</h4>
              {driver.schedules.length > 0 && (
                <select 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  {[...new Set(driver.schedules.map(s => s.date))].sort().reverse().map(date => {
                    const count = driver.schedules.filter(s => s.date === date).length;
                    const formatDate = new Date(date).toLocaleDateString('vi-VN', { 
                      weekday: 'short', 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    });
                    return (
                      <option key={date} value={date}>
                        {formatDate} ({count} ca)
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
            {driver.schedules.length > 0 && selectedDate ? (
              <div className="space-y-2">
                {driver.schedules.filter(s => s.date === selectedDate).map((schedule, index) => (
                  <div key={schedule.id || index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {schedule.shift_type === 'morning' ? 'Sáng' : 'Chiều'}
                      {schedule.start_time && ` ${schedule.start_time.slice(0,5)}`}
                    </span>
                    <span className="font-medium text-gray-800">
                      {schedule.route_name} • Xe {schedule.bus_number}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chưa có lịch trình làm việc nào</p>
            )}
          </div>
        )}

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
      </div>
    </form>
  );
};
export default DriverForm;