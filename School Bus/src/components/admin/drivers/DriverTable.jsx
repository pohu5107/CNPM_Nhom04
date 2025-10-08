import { useState } from 'react';
import Table from '../../common/Table';
import { mockDrivers, routes } from '../../../data/mockData';

const DriverTable = ({ onAdd, onEdit, onView, onDelete }) => {
  const [drivers] = useState(mockDrivers);
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Get unique routes for filter
  const uniqueRoutes = [...new Set(drivers.map(d => d.route))].sort();

  // Filter drivers
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.driverCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || driver.status === statusFilter;
    const matchesRoute = !routeFilter || driver.route === routeFilter;

    return matchesSearch && matchesStatus && matchesRoute;
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
      key: 'busNumber', 
      header: 'Xe/Tuyến',
      render: (item) => (
        <div style={{ fontSize: '12px' }}>
          <div>{item.busNumber}</div>
          <div style={{ color: '#6b7280' }}>{item.route}</div>
        </div>
      )
    },
    { 
      key: 'experience', 
      header: 'Kinh nghiệm' 
    },
    { 
      key: 'status', 
      header: 'Trạng thái',
      render: (item) => (
        <span className={`status-badge ${item.status === 'active' ? 'status-active' : 'status-inactive'}`}>
          {item.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      )
    }
  ];

  const filters = [
    {
      placeholder: 'Tất cả tuyến',
      value: routeFilter,
      onChange: setRouteFilter,
      options: uniqueRoutes.map(route => ({ value: route, label: route })),
      minWidth: '120px'
    },
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
      emptyMessage={searchTerm || statusFilter || routeFilter ? 'Không tìm thấy tài xế nào phù hợp' : 'Chưa có tài xế nào'}
    />
  );
};

export default DriverTable;