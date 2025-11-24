import { useState } from 'react';
import PropTypes from 'prop-types';
import Table from '../../common/Table';

const StudentTable = ({ students = [], loading = false, onAdd, onEdit, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');



  // Get unique classes for filter
  const uniqueClasses = [...new Set(students.map(s => s.class_name).filter(Boolean))].sort((a, b) => a.localeCompare(b));

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
          <p className="text-gray-500 mt-4">Đang tải danh sách học sinh...</p>
        </div>
      </div>
    );
  }

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id?.toString().includes(searchTerm.toLowerCase()) ||
      student.parent_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = !classFilter || student.class_name === classFilter;

    return matchesSearch && matchesClass;
  });

  const columns = [
    {
      key: 'id',
      header: 'Mã HS'
    },
    {
      key: 'name',
      header: 'Họ tên'
    },
    {
      key: 'grade',
      header: 'Khối'
    },
    {
      key: 'class_name',
      header: 'Lớp'
    },
    {
      key: 'parent_name',
      header: 'Phụ huynh'
    },
    {
      key: 'phone',
      header: 'SĐT',
      render: (value, row) => value || row?.parent_phone || '-'
    }
  ];

  const filters = [
    {
      placeholder: 'Tất cả lớp',
      value: classFilter,
      onChange: setClassFilter,
      options: uniqueClasses.map(cls => ({ value: cls, label: cls })),
      minWidth: '120px'
    }
  ];

  return (
    <Table
      title="Quản lý Học sinh"
      data={filteredStudents}
      columns={columns}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onAdd={onAdd}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      addButtonText="Thêm học sinh"
      filters={filters}
      emptyMessage={searchTerm || classFilter ? 'Không tìm thấy học sinh nào phù hợp' : 'Chưa có học sinh nào'}
    />
  );
};

StudentTable.propTypes = {
  students: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default StudentTable;