import { useState } from 'react';
import Table from '../../common/Table';
import { mockParents, mockStudents } from '../../../data/mockData';

const ParentTable = ({ onAdd, onEdit, onView, onDelete, onViewChildren }) => {
  const [parents] = useState(mockParents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Get children names for a parent
  const getChildrenNames = (childrenIds) => {
    return childrenIds.map(childId => {
      const student = mockStudents.find(s => s.id.toString() === childId);
      return student ? student.name : '';
    }).filter(name => name).join(', ');
  };

  // Filter parents
  const filteredParents = parents.filter(parent => {
    const matchesSearch = 
      parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone.includes(searchTerm);
    
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
      header: 'Email' 
    },
    { 
      key: 'phone', 
      header: 'Số điện thoại' 
    },
    { 
      key: 'address', 
      header: 'Địa chỉ',
      render: (item) => (
        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.address}
        </div>
      )
    },
    { 
      key: 'children', 
      header: 'Con em',
      render: (item) => {
        const childrenCount = item.children.length;
        
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewChildren(item);
              }}
              style={{
                background: 'none',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                color: '#3b82f6',
                fontSize: '11px',
                padding: '2px 6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#3b82f6';
              }}
              title="Xem danh sách con em"
            >
              Xem DS
            </button>
          </div>
        );
      }
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