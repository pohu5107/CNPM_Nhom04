import { MapPin } from "lucide-react";

export default function ArrivalConfirmModal({
  isOpen,
  currentStop,
  allStudentsPickedUp,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-70">
      <div className="bg-white rounded-xl p-6 max-w-md mx-4 border shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            Xác nhận đến điểm dừng
          </h3>
          <p className="text-gray-600 mb-6">
            Bạn đã đến{" "}
            <strong className="text-gray-900">{currentStop?.name}</strong>?
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={!allStudentsPickedUp}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              allStudentsPickedUp
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            Xác nhận
          </button>
        </div>
        {!allStudentsPickedUp && (
          <div className="mt-3 text-xs text-red-600 text-center">
            ⚠️ Cần đánh dấu đã đón toàn bộ học sinh trước khi tiếp tục.
          </div>
        )}
      </div>
    </div>
  );
}
