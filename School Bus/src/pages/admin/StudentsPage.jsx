import { useState } from 'react';
import StudentTable from '../../components/admin/students/StudentTable';
import StudentForm from '../../components/admin/students/StudentForm';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { mockStudents } from '../../data/mockData';

const StudentsPage = () => {
  const [students, setStudents] = useState(mockStudents);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add', 'edit', 'view'

  const handleAdd = () => {
    setFormMode('add');
    setSelectedStudent(null);
    setShowForm(true);
  };

  const handleEdit = (student) => {
    setFormMode('edit');
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleView = (student) => {
    setFormMode('view');
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setStudents(students.filter(s => s.id !== selectedStudent.id));
    setSelectedStudent(null);
  };

  const handleSubmit = (studentData) => {
    if (formMode === 'add') {
      const newStudent = {
        ...studentData,
        id: Math.max(...students.map(s => s.id)) + 1,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setStudents([...students, newStudent]);
    } else if (formMode === 'edit') {
      setStudents(students.map(s => 
        s.id === selectedStudent.id ? { ...s, ...studentData } : s
      ));
    }
    setShowForm(false);
    setSelectedStudent(null);
  };

  return (
    <div>
      <StudentTable
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          formMode === 'add' ? 'Thêm học sinh mới' :
          formMode === 'edit' ? 'Chỉnh sửa thông tin học sinh' :
          'Thông tin học sinh'
        }
        size="lg"
      >
        <StudentForm
          student={selectedStudent}
          mode={formMode}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa học sinh "${selectedStudent?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default StudentsPage;