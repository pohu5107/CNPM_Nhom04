import { AlertTriangle, Info, X } from 'lucide-react';
import PropTypes from 'prop-types';

const ScheduleConflictAlert = ({ error, onClose }) => {
  if (!error) return null;

  const isConflictError = error.includes('Xung đột lịch trình') || error.includes('đã được phân công');
  
  return (
    <div className={`mb-4 p-4 rounded-lg border-l-4 ${
      isConflictError 
        ? 'bg-yellow-50 border-yellow-400 text-yellow-800' 
        : 'bg-red-50 border-red-400 text-red-800'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isConflictError ? (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          ) : (
            <X className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {isConflictError ? 'Xung đột lịch trình' : 'Lỗi'}
          </h3>
          <div className="mt-1 text-sm">
            {error}
          </div>
          {isConflictError && (
            <div className="mt-2 flex items-center text-sm">
              <Info className="w-4 h-4 mr-1" />
              <span className="font-medium">Gợi ý:</span>
              <span className="ml-1">
                Chọn tài xế/xe buýt/tuyến khác hoặc thay đổi ngày/ca
              </span>
            </div>
          )}
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className="inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

ScheduleConflictAlert.propTypes = {
  error: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default ScheduleConflictAlert;