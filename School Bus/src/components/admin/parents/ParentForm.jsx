import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { parentsService } from '../../../services/parentsService';

const ParentForm = ({ parent, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    relationship: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [childrenDetails, setChildrenDetails] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(false);

  useEffect(() => {
    if (parent) {
      setFormData({
        name: parent.name || '',
        username: parent.username || '',
        email: parent.email || '',
        phone: parent.phone || '',
        relationship: parent.relationship || '',
        address: parent.address || ''
      });
    }
  }, [parent]);

  // Fetch children details when in view mode
  useEffect(() => {
    if (mode === 'view' && parent?.id) {
      const fetchChildren = async () => {
        try {
          setChildrenLoading(true);
          const data = await parentsService.getParentChildren(parent.id);
          setChildrenDetails(data);
        } catch (error) {
          console.error('Error fetching children:', error);
          setChildrenDetails([]);
        } finally {
          setChildrenLoading(false);
        }
      };
      fetchChildren();
    }
  }, [mode, parent?.id]);

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

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Nếu nhập email thì phải có username (tạo user để parent đăng nhập)
    if (formData.email && (!formData.username || !/^[a-zA-Z0-9_.-]{3,30}$/.test(formData.username))) {
      newErrors.username = 'Username hợp lệ (3-30 ký tự: chữ, số, _, -, .) là bắt buộc khi nhập email';
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

  // Render detailed view for parent information
  if (mode === 'view' && parent) {
    return (
      <div className="space-y-6">
        {/* Parent Basic Info Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600">
                  {parent.name.split(' ').slice(-1)[0].charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{parent.name}</h3>
                <p className="text-sm text-gray-600">Mã phụ huynh: #{parent.id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-700">{parent.relationship}</span>
                  {parent.phone && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{parent.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Số con em</div>
              <div className="text-2xl font-bold text-purple-600">{childrenDetails.length}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                📞
              </span>
              Thông tin liên hệ
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-sm text-gray-800 font-medium">{parent.email || 'Chưa có'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Số điện thoại</span>
                <span className="text-sm text-gray-800 font-medium">{parent.phone}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-500">Mối quan hệ</span>
                <span className="text-sm text-gray-800 font-medium">{parent.relationship}</span>
              </div>
              <div className="py-2">
                <span className="text-sm font-medium text-gray-500 block mb-1">Địa chỉ</span>
                <p className="text-sm text-gray-800">{parent.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Children List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              👨‍👩‍👧‍👦
            </span>
            Danh sách con em ({childrenDetails.length})
          </h4>
          
          {childrenLoading && (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="text-gray-500 mt-4">Đang tải danh sách con em...</p>
            </div>
          )}

          {!childrenLoading && childrenDetails.length > 0 && (
            <div className="space-y-4">
              {childrenDetails.map((child) => (
                <div key={child.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {/* Thông tin cơ bản */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {child.name ? child.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{child.name}</h5>
                      <div className="text-sm text-gray-600">
                        Lớp {child.class_name || child.class} • Khối {child.grade}
                      </div>
                      <div className="text-sm text-gray-500">
                        📍 {child.address} • 📞 {child.phone || 'Chưa có SĐT'}
                      </div>
                    </div>
                  </div>

                  {/* Thông tin tuyến đường và điểm đón */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                    {/* Tuyến sáng */}
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center text-sm">
                          🌅
                        </span>
                        <span className="font-medium text-gray-800">Sáng</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-600">Tuyến: </span>
                          <span className="font-medium">{child.morning_route_name || 'Chưa phân tuyến'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Điểm đón: </span>
                          <span>{child.morning_pickup_stop_name || 'Chưa có'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tuyến chiều */}
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center text-sm">
                          🌆
                        </span>
                        <span className="font-medium text-gray-800">Chiều</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-600">Tuyến: </span>
                          <span className="font-medium">{child.afternoon_route_name || 'Chưa phân tuyến'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Điểm trả: </span>
                          <span>{child.afternoon_dropoff_stop_name || 'Chưa có'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!childrenLoading && childrenDetails.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                👨‍👩‍👧‍👦
              </div>
              <p className="text-gray-600">Chưa có con em nào được đăng ký</p>
              <p className="text-sm text-gray-500 mt-1">Phụ huynh chưa có con em trong hệ thống</p>
            </div>
          )}
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

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        placeholder="Tên đăng nhập (3-30 ký tự)"
        required={false}
        readOnly={isReadOnly}
      />
      <FormInput
        label="Họ và tên"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Nhập họ và tên"
        required
        readOnly={isReadOnly}
      />

      <FormInput
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Nhập địa chỉ email"
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
        label="Quan hệ"
        name="relationship"
        type="select"
        value={formData.relationship}
        onChange={handleChange}
        error={errors.relationship}
        placeholder="Chọn mối quan hệ"
        options={[
          { value: 'Ba', label: 'Ba' },
          { value: 'Mẹ', label: 'Mẹ' },
          { value: 'Ông', label: 'Ông' },
          { value: 'Bà', label: 'Bà' },
          { value: 'Anh', label: 'Anh' },
          { value: 'Chị', label: 'Chị' },
          { value: 'Khác', label: 'Khác' }
        ]}
        readOnly={isReadOnly}
      />

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

ParentForm.propTypes = {
  parent: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    relationship: PropTypes.string,
    address: PropTypes.string,
  }),
  mode: PropTypes.oneOf(['add', 'edit', 'view']).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ParentForm;