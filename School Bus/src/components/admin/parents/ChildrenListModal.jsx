import React from 'react';
import Modal from '../../UI/Modal';
import Button from '../../common/Button';
import { mockStudents } from '../../../data/mockData';

const ChildrenListModal = ({ isOpen, onClose, parent, children = [] }) => {
  // Find actual students from mockStudents based on parent ID
  const childrenDetails = mockStudents.filter(student => 
    student.parentId === parent?.id
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Danh sách con em - ${parent?.name}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Header Info */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="font-medium text-slate-900 mb-1">
            Phụ huynh: {parent?.name}
          </div>
          <div className="text-sm text-slate-600">
            Tổng số con: {childrenDetails.length} học sinh
          </div>
        </div>

        {/* Children List */}
        {childrenDetails.length > 0 ? (
          <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
            {childrenDetails.map((child, index) => (
              <div 
                key={child.id}
                className={`flex justify-between items-center p-4 border-b border-slate-200 last:border-b-0 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium text-slate-900 mb-1 text-sm">
                    {child.name}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>🆔 Mã HS: {child.studentCode}</div>
                    <div>📚 Lớp: {child.class}</div>
                    <div>🎂 Ngày sinh: {new Date(child.dateOfBirth).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 italic bg-slate-50 border border-slate-200 rounded-lg">
            📝 Chưa có con em nào được đăng ký
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-4 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChildrenListModal;