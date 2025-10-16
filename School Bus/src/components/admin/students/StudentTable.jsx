import { useState } from 'react';
import PropTypes from 'prop-types';
import Table from '../../common/Table';
import { mockStudents } from '../../../data/mockData';

const StudentTable = ({ onAdd, onEdit, onView, onDelete }) => {
  const [students] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');



  // Get unique classes for filter
  const uniqueClasses = [...new Set(students.map(s => s.class))].sort((a, b) => a.localeCompare(b));

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = !classFilter || student.class === classFilter;

    return matchesSearch && matchesClass;
  });

  const columns = [
    { 
      key: 'studentCode', 
      header: 'Mã HS' 
    },
    { 
      key: 'name', 
      header: 'Họ tên' 
    },
    { 
      key: 'class', 
      header: 'Lớp' 
    },
    { 
      key: 'parentName', 
      header: 'Phụ huynh' 
    },
    { 
      key: 'dateOfBirth', 
      header: 'Ngày sinh',
      render: (item) => new Date(item.dateOfBirth).toLocaleDateString('vi-VN')
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
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default StudentTable;