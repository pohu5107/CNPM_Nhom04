import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { parentsService } from '../../../services/parentsService';

// Thành phần con nhỏ (ChildCard) — hiển thị thông tin con/em gọn nhẹ
const ChildCard = ({ child }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-lg font-bold text-blue-600">
          {child.name?.charAt(0).toUpperCase() || '?'}
        </span>
      </div>
      <div className="flex-1">
        <h5 className="font-semibold text-gray-900">{child.name}</h5>
        <div className="text-sm text-gray-600">Lớp {child.class_name || child.class} • Khối {child.grade}</div>
        <div className="text-sm text-gray-500">📍 {child.address} • 📞 {child.phone || 'Chưa có SĐT'}</div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
      <div className="bg-white rounded-lg p-3 border">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center text-sm">🌅</span>
          <span className="font-medium text-gray-800">Tuyến sáng</span>
        </div>
        <span className="text-sm font-medium text-gray-800">{child.morning_route_name || 'Chưa có'}</span>
      </div>
      
      <div className="bg-white rounded-lg p-3 border">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center text-sm">🌆</span>
          <span className="font-medium text-gray-800">Tuyến chiều</span>
        </div>
        <span className="text-sm font-medium text-gray-800">{child.afternoon_route_name || 'Chưa có'}</span>
      </div>
    </div>
  </div>
);

const ParentForm = ({ parent, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', phone: '', relationship: '', address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [childrenDetails, setChildrenDetails] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(false);

  // Tải dữ liệu phụ huynh vào form
  useEffect(() => {
    if (parent) {
      setFormData({
        name: parent.name || '', username: parent.username || '', email: parent.email || '',
        phone: parent.phone || '', relationship: parent.relationship || '', address: parent.address || ''
      });
    }
  }, [parent]);


  // Tải danh sách con ở chế độ xem và loại bỏ bản ghi trùng lặp
  useEffect(() => {
    if (mode === 'view' && parent?.id) {
      const fetchChildren = async () => {
        try {
          setChildrenLoading(true);
          const data = await parentsService.getParentChildren(parent.id);
          
          // Deduplicate children by id or composite key
          const childMap = new Map();
          (data || []).forEach(child => {
            const key = child.id || `${child.name}-${child.class_name || child.class}-${child.grade}`;
            if (!childMap.has(key)) {
              childMap.set(key, { ...child });
            } else {
              const existing = childMap.get(key);
              // Gộp các trường còn thiếu từ các dòng trùng lặp
              Object.keys(child).forEach(field => {
                if (!existing[field] && child[field]) existing[field] = child[field];
              });
            }
          });
          
          setChildrenDetails(Array.from(childMap.values()));
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
    
    if (!formData.name.trim()) newErrors.name = 'Họ tên là bắt buộc';
    if (!formData.address.trim()) newErrors.address = 'Địa chỉ là bắt buộc';
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (formData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
      if (!formData.username || !/^[a-zA-Z0-9_.-]{3,30}$/.test(formData.username)) {
        newErrors.username = 'Username bắt buộc khi có email (3-30 ký tự)';
      }
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
    
    // Xóa lỗi khi người dùng bắt đầu nhập
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

  // View mode - parent details
  if (mode === 'view' && parent) {
    const initials = parent.name.split(' ').slice(-1)[0].charAt(0);
    
    return (
      <div className="space-y-6">
        {/* Parent header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600">{initials}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{parent.name}</h3>
                <p className="text-sm text-gray-600">Mã: #{parent.id}</p>
                <p className="text-sm text-gray-700">{parent.relationship} • {parent.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Số con em</div>
              <div className="text-2xl font-bold text-purple-600">{childrenDetails.length}</div>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">📞</span>
            Thông tin liên hệ
          </h4>
          <div className="space-y-3">
            {[
              ['Email', parent.email || 'Chưa có'],
              ['Số điện thoại', parent.phone],
              ['Mối quan hệ', parent.relationship],
              ['Địa chỉ', parent.address]
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                <span className="text-sm text-gray-800 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Children list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">👨‍👩‍👧‍👦</span>
            Danh sách con em ({childrenDetails.length})
          </h4>
          
          {childrenLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="text-gray-500 mt-4">Đang tải...</p>
            </div>
          ) : childrenDetails.length > 0 ? (
            <div className="space-y-4">
              {childrenDetails.map((child) => (
                <ChildCard key={child.id || `${child.name}-${child.class_name}`} child={child} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">👨‍👩‍👧‍👦</div>
              <p className="text-gray-600">Chưa có con em nào</p>
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

  // Form fields configuration
  const formFields = [
    { name: 'name', label: 'Họ và tên', placeholder: 'Nhập họ và tên', required: true },
    { name: 'username', label: 'Username', placeholder: 'Tên đăng nhập (3-30 ký tự)' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Nhập địa chỉ email' },
    { name: 'phone', label: 'Số điện thoại', type: 'tel', placeholder: 'Nhập số điện thoại', required: true },
    { 
      name: 'relationship', label: 'Quan hệ', type: 'select', placeholder: 'Chọn mối quan hệ',
      options: [
        { value: 'Ba', label: 'Ba' }, { value: 'Mẹ', label: 'Mẹ' }, { value: 'Ông', label: 'Ông' },
        { value: 'Bà', label: 'Bà' }, { value: 'Anh', label: 'Anh' }, { value: 'Chị', label: 'Chị' }, 
        { value: 'Khác', label: 'Khác' }
      ]
    },
    { name: 'address', label: 'Địa chỉ', type: 'textarea', placeholder: 'Nhập địa chỉ đầy đủ', required: true, rows: 3 }
  ];

  return (
    <form onSubmit={handleSubmit}>
      {formFields.map(field => (
        <FormInput
          key={field.name}
          {...field}
          value={formData[field.name]}
          onChange={handleChange}
          error={errors[field.name]}
          readOnly={isReadOnly}
        />
      ))}

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