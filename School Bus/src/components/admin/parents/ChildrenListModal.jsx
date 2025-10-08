import { mockStudents } from '../../../data/mockData';
import Modal from '../../UI/Modal';
import Button from '../../common/Button';

const ChildrenListModal = ({ isOpen, onClose, parent }) => {
  // Get children details for display
  const getChildrenDetails = () => {
    if (!parent?.children?.length) return [];
    
    return parent.children.map(childId => {
      const student = mockStudents.find(s => s.id.toString() === childId);
      return student ? {
        id: student.id,
        name: student.name,
        class: student.class,
        route: student.busRoute,
        pickupPoint: student.pickupPoint
      } : null;
    }).filter(child => child !== null);
  };

  const childrenDetails = getChildrenDetails();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Danh sách con em - ${parent?.name}`}
      size="md"
    >
      <div className="children-list-modal">
        {/* Header Info */}
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#f8fafc', 
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontWeight: '500', color: '#1e293b', marginBottom: '4px' }}>
            Phụ huynh: {parent?.name}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Tổng số con: {childrenDetails.length} học sinh
          </div>
        </div>

        {/* Children List */}
        {childrenDetails.length > 0 ? (
          <div className="children-list-container" style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            {childrenDetails.map((child, index) => (
              <div 
                key={child.id}
                className="child-item"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: index < childrenDetails.length - 1 ? '1px solid #e2e8f0' : 'none',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                }}
              >
                <div className="child-info" style={{ flex: 1 }}>
                  <div className="child-name" style={{ 
                    fontWeight: '500', 
                    color: '#1e293b',
                    marginBottom: '4px',
                    fontSize: '15px'
                  }}>
                    {child.name}
                  </div>
                  <div className="child-details" style={{ 
                    fontSize: '13px', 
                    color: '#64748b',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <span>📚 Lớp: {child.class}</span>
                    <span>🚌 Tuyến: {child.route}</span>
                    <span>📍 Điểm đón: {child.pickupPoint}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            padding: '24px',
            textAlign: 'center',
            color: '#64748b',
            fontStyle: 'italic',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            📝 Chưa có con em nào được đăng ký
          </div>
        )}

        {/* Footer */}
        <div className="modal-footer" style={{ marginTop: '20px' }}>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChildrenListModal;