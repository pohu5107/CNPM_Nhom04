import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Xác nhận", 
  cancelText = "Hủy" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {title}
            </h3>
            <p className="text-slate-600">
              {message}
            </p>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button 
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
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
    </div>
  );
};

export default ConfirmDialog;