import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';

import { parentsService } from '../../../services/parentsService';




const ParentForm = ({ parent, mode, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', phone: '', relationship: '', address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [childrenDetails, setChildrenDetails] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(false);


  useEffect(() => {
    if (parent) {
      setFormData({
        name: parent.name || '', username: parent.username || '', email: parent.email || '',
        phone: parent.phone || '', relationship: parent.relationship || '', address: parent.address || ''
      });
    }
  }, [parent]);



  useEffect(() => {
    if (mode === 'view' && parent?.id) {
      const fetchChildren = async () => {
        try {
          setChildrenLoading(true);
          const data = await parentsService.getParentChildren(parent.id);
          
  
          const childMap = new Map();
          (data || []).forEach(child => {
            const key = child.id || `${child.name}-${child.class_name || child.class}-${child.grade}`;
            if (!childMap.has(key)) {
              childMap.set(key, { ...child });
            } else {
              const existing = childMap.get(key);

              Object.keys(child).forEach(field => {
                if (!existing[field] && child[field]) existing[field] = child[field];
              });
            }
          });
          
          setChildrenDetails(Array.from(childMap.values()));
        } catch (error) {

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

      {/* Thông tin con em - chỉ hiển thị khi view */}
      {mode === 'view' && parent?.id && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Danh sách con em ({childrenDetails.length})
          </h4>
          {childrenLoading ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : childrenDetails.length > 0 ? (
            <div className="space-y-3">
              {childrenDetails.map((child, index) => (
                <div key={child.id || index} className="bg-white rounded p-3 border text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{child.name}</span>
                      <span className="ml-2 text-gray-600">
                        Lớp {child.class_name || child.class} • Khối {child.grade}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">#{child.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                     
                      Sáng: {child.morning_route_name || 'Chưa có'}
                    </div>
                    <div>
             
                      Chiều: {child.afternoon_route_name || 'Chưa có'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có con em nào</p>
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
    </form>
  );
};


export default ParentForm;