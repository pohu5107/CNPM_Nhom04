import { useState } from 'react';
import Table from '../../common/Table';

const ParentTable = ({ parents = [], loading = false, onAdd, onEdit, onView, onDelete }) => {
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
          <p className="text-gray-500 mt-4">Đang tải danh sách phụ huynh...</p>
        </div>
      </div>
    );
  }

  // Filter parents
  const filteredParents = parents.filter(parent => {
    const matchesSearch = 
      parent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone?.includes(searchTerm);
    
    const matchesStatus = !statusFilter || parent.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      key: 'name', 
      header: 'Họ tên' 
    },
    { 
      key: 'email', 
      header: 'Email',
      render: (value) => (
        <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || 'Chưa có'}
        </div>
      )
    },
    { 
      key: 'phone', 
      header: 'Số điện thoại' 
    },
    { 
      key: 'address', 
      header: 'Địa chỉ',
      render: (value) => (
        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </div>
      )
    },
    { 
      key: 'children_count', 
      header: 'Con em',
      render: (value, row) => {
        const childrenCount = (value ?? row?.children_count) || 0;
        
        if (childrenCount === 0) {
          return <span style={{ color: '#64748b', fontStyle: 'italic' }}>Chưa có</span>;
        }
        
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              fontSize: '14px', 
              color: '#3b82f6', 
              fontWeight: '500' 
            }}>
              {childrenCount} con
            </span>
          </div>
        );
      }
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
      title="Quản lý Phụ huynh"
      data={filteredParents}
      columns={columns}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onAdd={onAdd}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      addButtonText="Thêm phụ huynh"
      filters={filters}
      emptyMessage={searchTerm || statusFilter ? 'Không tìm thấy phụ huynh nào phù hợp' : 'Chưa có phụ huynh nào'}
    />
  );
};

export default ParentTable;