import { Play, Users, CheckCircle, AlertTriangle, Phone } from "lucide-react";

export default function FloatingActionButtons({
  tripStatus,
  pausedWaypointIdx,
  allStudentsPickedUp,
  getRemainingStudents,
  onStartTrip,
  onOpenStudents,
  onConfirmArrival,
  onReportIncident,
  onEmergencyCall,
}) {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
      {/* Start Trip Button */}
      {tripStatus === "not_started" && (
        <button
          onClick={onStartTrip}
          className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-all shadow-green-200 pulse-animation"
          title="🚀 Bắt đầu chuyến"
        >
          <Play className="w-7 h-7" />
        </button>
      )}

      {/* Students List Button */}
      {tripStatus !== "not_started" && (
        <button
          onClick={onOpenStudents}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-all shadow-blue-200 relative"
          title="🧍 Danh sách học sinh"
        >
          <Users className="w-7 h-7" />
          {getRemainingStudents() > 0 && (
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {getRemainingStudents()}
            </div>
          )}
        </button>
      )}

      {/* Confirm Arrival Button */}
      {tripStatus !== "not_started" && pausedWaypointIdx !== null && (
        <button
          onClick={onConfirmArrival}
          disabled={!allStudentsPickedUp}
          className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all transform hover:scale-105 ${
            allStudentsPickedUp
              ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
          title={
            allStudentsPickedUp
              ? "Đã đón xong - tiếp tục"
              : "Cần đón đủ học sinh trước"
          }
        >
          <CheckCircle className="w-7 h-7" />
        </button>
      )}

      {/* Report Incident Button */}
      <button
        onClick={onReportIncident}
        className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-all shadow-red-200"
        title="⚠️ Báo cáo sự cố"
      >
        <AlertTriangle className="w-7 h-7" />
      </button>

      {/* Emergency Call Button */}
      <button
        onClick={onEmergencyCall}
        className="w-16 h-16 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-all shadow-yellow-200"
        title="📞 Liên hệ khẩn cấp"
      >
        <Phone className="w-7 h-7" />
      </button>
    </div>
  );
}
