import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-body">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
              {title}
            </h3>
            <p style={{ color: '#6b7280' }}>
              {message}
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;