import { ArrowLeft, Clock, Settings } from "lucide-react";

export default function DriverHeader({
  schedule,
  isTracking,
  onBack,
  onOpenSettings,
}) {
  return (
    <div className="bg-white shadow-lg border-b z-40 flex-shrink-0 sticky top-0">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left section - Navigation & Trip Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Quay lại danh sách chuyến"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  isTracking ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <div>
                <div className="font-bold text-lg text-gray-900">
                  {schedule.routeName} • {schedule.busNumber}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-4">
                  <span>Mã chuyến: #{schedule.id}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {schedule.startTime} - {schedule.endTime}
                  </span>
          
                </div>
              </div>
            </div>
          </div>

          {/* Right section  */}
          <div className="flex items-center gap-4">
     
            <button
              onClick={onOpenSettings}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cài đặt / Kết thúc ca"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
