import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { Calendar, Clock, Truck, Route, TrendingUp, User, Phone, CreditCard, MapPin, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

// Component Calendar để chọn ngày và xem lịch trình
const ScheduleCalendar = ({ driver }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Nhóm schedules theo ngày
  const schedulesByDate = driver?.schedules?.reduce((acc, schedule) => {
    const dateKey = schedule.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(schedule);
    return acc;
  }, {}) || {};
  
  // Lấy danh sách các ngày có lịch trình
  const availableDates = Object.keys(schedulesByDate).sort();
  const selectedSchedules = schedulesByDate[selectedDate] || [];
  
  // Set ngày đầu tiên có sẵn làm mặc định
  useEffect(() => {
    if (availableDates.length > 0 && !schedulesByDate[selectedDate]) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate, schedulesByDate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Lịch trình làm việc
          {driver?.schedules && (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {driver.schedules.length} ca
            </span>
          )}
        </h3>
      </div>

      {availableDates.length > 0 ? (
        <div className="p-6">
          {/* Bộ chọn ngày */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ngày làm việc
            </label>
            <div className="flex items-center gap-3">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableDates.map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)} ({schedulesByDate[date].length} ca)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lịch trình của ngày được chọn */}
          {selectedSchedules.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                📅 {formatDate(selectedDate)}
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {selectedSchedules.length} chuyến
                </span>
              </h4>
              
              <div className="grid gap-4">
                {selectedSchedules.map((schedule, index) => (
                  <div key={`${schedule.id}-${index}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Thời gian */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Ca {schedule.shift_number} • {schedule.shift_type === 'morning' ? 'Sáng' : 'Chiều'}
                          </div>
                        </div>
                      </div>

                      {/* Tuyến đường */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Route className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{schedule.route_name}</div>
                          <div className="text-sm text-gray-600">
                            {schedule.start_point} → {schedule.end_point}
                          </div>
                        </div>
                      </div>

                      {/* Xe buýt */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Xe {schedule.bus_number}</div>
                          <div className="text-sm text-gray-600">BKS: {schedule.license_plate}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Tài xế chưa có lịch trình làm việc nào</p>
        </div>
      )}
    </div>
  );
};

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

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        phone: driver.phone || '',
        license_number: driver.license_number || '',
        address: driver.address || '',
        status: driver.status || 'active'
      });
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

  // Hiển thị chế độ xem chi tiết thông tin tài xế
  const renderDetailedView = () => {
    if (mode !== 'view') {
      return null;
    }

    return (
      <div className="space-y-6">
        {/* Header với ảnh tài xế */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-6">
            {/* Ảnh tài xế */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">
                  {driver.name ? driver.name.split(' ').slice(-1)[0].charAt(0).toUpperCase() : 'T'}
                </span>
              </div>
            </div>
            
            {/* Thông tin cơ bản */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500 font-medium">Họ tên</div>
                <div className="text-lg font-semibold text-gray-900">{driver.name}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 font-medium">Điện thoại</div>
                <div className="text-sm font-medium text-gray-900">{driver.phone}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 font-medium">Bằng lái</div>
                <div className="text-sm font-medium text-gray-900">{driver.license_number}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 font-medium">Trạng thái</div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  driver.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {driver.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
              
              {driver.address && (
                <div className="md:col-span-2">
                  <div className="text-xs text-gray-500 font-medium">Địa chỉ</div>
                  <div className="text-sm text-gray-900">{driver.address}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lịch trình làm việc với Calendar */}
        <ScheduleCalendar driver={driver} />

        {/* Thông tin hệ thống */}
        {(driver.email || driver.username) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium mb-1">Thông tin hệ thống</div>
                {driver.email && (
                  <div className="text-sm text-gray-900">Email: {driver.email}</div>
                )}
                {driver.username && (
                  <div className="text-sm text-gray-600">Username: {driver.username}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {mode === 'view' ? (
          // Bố cục chế độ xem chi tiết
        <div>
          {renderDetailedView()}
          <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-slate-200">
            <Button variant="secondary" onClick={onCancel}>
              Đóng
            </Button>
          </div>
        </div>
      ) : (
        // Bố cục form chuẩn cho thêm/sửa
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

            {!isReadOnly && (
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
              />
            )}

            {isReadOnly && (
              <div className="space-y-2">
                <div className="block text-sm font-medium text-slate-700">Trạng thái</div>
                <div className="py-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    formData.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {formData.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
              </div>
            )}
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
        </div>
      )}
    </form>
  );
};

DriverForm.propTypes = {
  driver: PropTypes.object,
  mode: PropTypes.oneOf(['add', 'edit', 'view']).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default DriverForm;