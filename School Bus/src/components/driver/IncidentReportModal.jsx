import { AlertTriangle, X, Send } from "lucide-react";

export default function IncidentReportModal({
  isOpen,
  incidentText,
  onIncidentTextChange,
  onSubmit,
  onClose,
}) {
  if (!isOpen) return null;

  const quickOptions = [
    { text: "🚗 Xe hỏng", value: "Xe gặp sự cố kỹ thuật" },
    { text: "🚦 Kẹt xe", value: "Giao thông kẹt xe nghiêm trọng" },
    { text: "👤 HS không đến", value: "Học sinh không có mặt tại điểm đón" },
    { text: "⚠️ Khẩn cấp", value: "Tình huống khẩn cấp cần hỗ trợ ngay" },
  ];

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-70">
      <div className="bg-white rounded-xl p-6 max-w-md mx-4 w-full border shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Báo cáo sự cố
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick incident options */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">Chọn nhanh loại sự cố:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => onIncidentTextChange(option.value)}
                className="p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-red-300 transition-colors text-left"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={incidentText}
          onChange={(e) => onIncidentTextChange(e.target.value)}
          placeholder="Mô tả chi tiết tình huống sự cố (vị trí, mức độ nghiêm trọng...)"
          className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            disabled={!incidentText.trim()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Gửi báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}
