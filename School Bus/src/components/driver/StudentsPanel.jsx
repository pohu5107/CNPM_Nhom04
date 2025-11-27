import { Users, X, CheckCircle, XCircle, Clock, Phone } from "lucide-react";

export default function StudentsPanel({
  isOpen,
  stops,
  currentStopIndex,
  pausedWaypointIdx,
  busNumber,
  totalStudents,
  getTotalPickedUp,
  getTotalAbsent,
  getRemainingStudents,
  allStudentsPickedUp,
  toggleStudentStatus,
  markStudentAbsent,
  onClose,
  onConfirmArrival,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Học sinh - {busNumber}
                </h3>
                <div className="text-blue-100 text-sm mt-1">
                  {getTotalPickedUp()}/{totalStudents} đã đón
                </div>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-blue-800/50 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {stops
              .filter((stop) => !stop.isStartOrEnd)
              .map((stop, stopIndex) => (
                <div key={stop.id} className="border-b border-gray-200">
                  {/* Stop Header */}
                  <div className="bg-gray-50 px-4 py-3 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                          stop.id - 1 === currentStopIndex
                            ? "bg-blue-500"
                            : stop.id - 1 < currentStopIndex
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {stopIndex + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {stop.name}
                        </div>
                        <div className="text-sm text-gray-500">{stop.time}</div>
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          stop.id - 1 === currentStopIndex
                            ? "bg-blue-100 text-blue-700"
                            : stop.id - 1 < currentStopIndex
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {stop.id - 1 === currentStopIndex
                          ? "Hiện tại"
                          : stop.id - 1 < currentStopIndex
                          ? "Hoàn thành"
                          : "Chờ"}
                      </div>
                    </div>
                  </div>

                  {/* Students List */}
                  <div className="p-4 space-y-3">
                    {stop.students.map((student) => (
                      <div
                        key={student.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          student.status === "picked_up"
                            ? "bg-green-50 border-green-200"
                            : student.status === "absent"
                            ? "bg-red-50 border-red-200"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {student.class}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-mono">
                              {student.phone}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-3">
                            {/* Status Indicator */}
                            {student.status === "picked_up" ? (
                              <div className="text-green-600 text-sm font-medium flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Đã đón
                              </div>
                            ) : student.status === "absent" ? (
                              <div className="text-red-600 text-sm font-medium flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                Vắng mặt
                              </div>
                            ) : (
                              <div className="text-orange-600 text-sm font-medium flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Chờ đón
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  toggleStudentStatus(stop.id, student.id)
                                }
                                className={`p-2 rounded-lg transition-colors ${
                                  student.status === "picked_up"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 text-gray-600 hover:bg-green-600 hover:text-white"
                                }`}
                                title="Đánh dấu đã đón"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  markStudentAbsent(stop.id, student.id)
                                }
                                className={`p-2 rounded-lg transition-colors ${
                                  student.status === "absent"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-200 text-gray-600 hover:bg-red-600 hover:text-white"
                                }`}
                                title="Đánh dấu vắng mặt"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  window.open(`tel:${student.phone}`)
                                }
                                className="p-2 bg-gray-200 text-gray-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                                title="Gọi điện"
                              >
                                <Phone className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getTotalPickedUp()}
                </div>
                <div className="text-xs text-gray-600">Đã đón</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {getRemainingStudents()}
                </div>
                <div className="text-xs text-gray-600">Còn lại</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {getTotalAbsent()}
                </div>
                <div className="text-xs text-gray-600">Vắng</div>
              </div>
            </div>

        

            {pausedWaypointIdx !== null && (
              <button
                onClick={onConfirmArrival}
                disabled={!allStudentsPickedUp}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  allStudentsPickedUp
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                {allStudentsPickedUp
                  ? "Đã đón xong - Tiếp tục"
                  : "Chưa đón đủ học sinh"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
