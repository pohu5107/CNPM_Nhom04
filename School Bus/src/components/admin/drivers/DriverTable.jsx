import { useState } from 'react';
import PropTypes from 'prop-types';
import Table from '../../common/Table';

const DriverTable = ({ drivers = [], loading = false, onAdd, onEdit, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Loading state
  if (loading) {
    return (
      <div className="mx-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <p className="text-gray-500 mt-4">Đang tải danh sách tài xế...</p>
        </div>
      </div>
    );
  }

  // Filter drivers
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.license_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || driver.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      key: 'id', 
      header: 'Mã TX' 
    },
    { 
      key: 'name', 
      header: 'Họ tên' 
    },
    { 
      key: 'phone', 
      header: 'Số điện thoại' 
    },
    { 
      key: 'license_number', 
      header: 'Bằng lái' 
    },
    { 
      key: 'address', 
      header: 'Địa chỉ',
      render: (value) => (
        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || 'Chưa cập nhật'}
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Trạng thái',
      render: (value) => (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-slate-200 text-slate-600'
        }`}>
          {value === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      )
    }
  ];

  const filters = [
    {
      placeholder: 'Tất cả trạng thái',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Không hoạt động' }
      ],
      minWidth: '130px'
    }
  ];

  return (
    <Table
      title="Quản lý Tài xế"
      data={filteredDrivers}
      columns={columns}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onAdd={onAdd}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      addButtonText="Thêm tài xế"
      filters={filters}
      emptyMessage={searchTerm || statusFilter ? 'Không tìm thấy tài xế nào phù hợp' : 'Chưa có tài xế nào'}
    />
  );
};



export default DriverTable;