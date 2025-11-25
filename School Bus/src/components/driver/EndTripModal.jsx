import { LogOut, X } from "lucide-react";

export default function EndTripModal({
  isOpen,
  routeName,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-70">
      <div className="bg-white rounded-xl p-6 max-w-md mx-4 border shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Kết thúc chuyến đi
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-gray-600">
            Bạn có chắc chắn muốn kết thúc chuyến{" "}
            <strong className="text-gray-900">{routeName}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Hành động này không thể hoàn tác
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
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Kết thúc
          </button>
        </div>
      </div>
    </div>
  );
}
