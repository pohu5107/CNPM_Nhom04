import React, { useState, useEffect } from 'react';
import Modal from '../../UI/Modal';
import Button from '../../common/Button';
import { parentsService } from '../../../services/parentsService';

const ChildrenListModal = ({ isOpen, onClose, parent, children = [] }) => {
  const [childrenDetails, setChildrenDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch children details when modal opens
  useEffect(() => {
    if (isOpen && parent?.id) {
      const fetchChildren = async () => {
        try {
          setLoading(true);
          setError(null);
          console.log('🔵 Fetching children for parent:', parent.id);
          const data = await parentsService.getParentChildren(parent.id);
          console.log('✅ Children data received:', data);
          setChildrenDetails(data);
        } catch (error) {
          console.error('❌ Error fetching children:', error);
          setError('Không thể tải danh sách con em');
          setChildrenDetails([]);
        } finally {
          setLoading(false);
        }
      };
      fetchChildren();
    }
  }, [isOpen, parent?.id]);

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
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-slate-500 mt-4">Đang tải danh sách con em...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 bg-red-50 border border-red-200 rounded-lg">
            ⚠️ {error}
          </div>
        ) : childrenDetails.length > 0 ? (
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
                    <div>📚 Lớp: {child.class || child.class_name || 'Chưa xác định'}</div>
                    <div>🏫 Khối: {child.grade}</div>
                    <div>� Địa chỉ: {child.address}</div>
                    <div>📞 SĐT: {child.phone}</div>
                    {child.route_name && (
                      <div>🚌 Tuyến: {child.route_name}</div>
                    )}
                    {child.bus_number && (
                      <div>🚍 Xe buýt: {child.bus_number}</div>
                    )}
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