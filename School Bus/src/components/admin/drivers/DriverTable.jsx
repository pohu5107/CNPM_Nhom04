import { useState } from 'react';
import Table from '../../common/Table';
import { mockDrivers } from '../../../data/mockData';

const DriverTable = ({ onAdd, onEdit, onView, onDelete }) => {
  const [drivers] = useState(mockDrivers);
  const [searchTerm, setSearchTerm] = useState('');
  // const [RouteFilter, setRouteFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Get unique routes for filter
  const UniqueRoutes = [...new Set(drivers.map(d => d.route))].sort();

  // Filter drivers
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.driverCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || driver.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      key: 'driverCode', 
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
      key: 'licenseNumber', 
      header: 'Bằng lái' 
    },
    { 
      key: 'experience', 
      header: 'Kinh nghiệm' 
    },
    { 
      key: 'status', 
      header: 'Trạng thái',
      render: (item) => (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
          item.status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-slate-200 text-slate-600'
        }`}>
          {item.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
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