import { useState, useEffect } from 'react';
import StudentTable from '../../components/admin/students/StudentTable';
import StudentForm from '../../components/admin/students/StudentForm';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import Header from '../../components/admin/Header';
import { studentsService } from '../../services/studentsService';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add', 'edit', 'view'

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsService.getAllStudents();

      setStudents(data);
      setError(null);
    } catch (err) {
      setError('Lỗi khi tải danh sách học sinh: ' + err.message);
  
    } finally {
      setLoading(false);
    }
  };

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

  const confirmDelete = async () => {
    try {
      await studentsService.deleteStudent(selectedStudent.id);
      await fetchStudents(); 
      setSelectedStudent(null);
      setShowConfirm(false);
    } catch (err) {
      setError('Lỗi khi xóa học sinh: ' + err.message);

    }
  };

  const handleSubmit = async (studentData) => {
    try {
      if (formMode === 'add') {
        await studentsService.createStudent(studentData);
      } else if (formMode === 'edit') {
        await studentsService.updateStudent(selectedStudent.id, studentData);
      }
      await fetchStudents(); 
      setShowForm(false);
      setSelectedStudent(null);
      setError(null);
    } catch (err) {
      setError('Lỗi khi lưu học sinh: ' + err.message);
   
    }
  };

  return (
    <div>
      <Header title="QUẢN LÝ HỌC SINH" />
      {error && (
        <div className="mx-8 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <StudentTable
        students={students}
        loading={loading}
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