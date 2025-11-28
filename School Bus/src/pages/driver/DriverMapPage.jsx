import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import BusRoutePause from "../../components/map/BusRoutePause.jsx";
import DriverHeader from "../../components/driver/DriverHeader.jsx";
import AlertsContainer from "../../components/driver/AlertsContainer.jsx";
import TripStatusPanel from "../../components/driver/TripStatusPanel.jsx";
import FloatingActionButtons from "../../components/driver/FloatingActionButtons.jsx";
import ArrivalConfirmModal from "../../components/driver/ArrivalConfirmModal.jsx";
import IncidentReportModal from "../../components/driver/IncidentReportModal.jsx";
import EndTripModal from "../../components/driver/EndTripModal.jsx";
import StudentsPanel from "../../components/driver/StudentsPanel.jsx";
import { studentsService } from "../../services/studentsService.js";
import { notificationsService } from "../../services/notificationsService.js";
import { 
  FaPlay, FaUsers, FaCheckCircle, FaExclamationTriangle, 
  FaPhone, FaMapMarkerAlt, FaClock, FaCompass, 
  FaTimes, FaPaperPlane, FaSignOutAlt, FaArrowLeft, 
  FaCog, FaTimesCircle 
} from "react-icons/fa";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function DriverMapPage() {
  const navigate = useNavigate();
  const { scheduleId } = useParams();

  // States
  const [status, setStatus] = useState("not_started");
  const [stopIdx, setStopIdx] = useState(0);
  const [notices, setNotices] = useState([]);
  const [showStudents, setShowStudents] = useState(false);
  const [showIncident, setShowIncident] = useState(false);
  const [showArrival, setShowArrival] = useState(false);
  const [showEndTrip, setShowEndTrip] = useState(false);
  const [incidentMsg, setIncidentMsg] = useState("");
  const [tracking, setTracking] = useState(true);
  const [clock, setClock] = useState(new Date());
  const [resumeFn, setResumeFn] = useState(null);
  const [pausedWpIdx, setPausedWpIdx] = useState(null);
  const [busCurrentPosition, setBusCurrentPosition] = useState(null);

  // Mock schedule & stops; only students fetched from API
  const mockSchedule = {
    id: scheduleId || 1,
    routeName: "Tuyến Quận 1 - Sáng",
    busNumber: "BUS-04",
    startTime: "06:00",
    endTime: "07:0",
    totalStudents: 0,
  };

  const mockStops = useMemo(
    () => [
      {
        id: 1,
        name: "Nhà Văn hóa Thanh Niên",
        time: "06:00",
        lat: 10.75875,
        lng: 106.68095,
        students: [],
        isStartOrEnd: true,
      },
      {
        id: 2,
        name: "Nguyễn Văn Cừ",
        time: "06:20",
        lat: 10.76055,
        lng: 106.6834,
        students: [],
      },
      {
        id: 3,
        name: "Nguyễn Biểu",
        time: "06:40",
        lat: 10.7579,
        lng: 106.6831,
        students: [],
      },
      {
        id: 4,
        name: "Trường THCS Nguyễn Du",
        time: "07:00",
        lat: 10.7545,
        lng: 106.6815,
        students: [],
        isStartOrEnd: true,
      },
    ],
    []
  );

  const [schedule, setSchedule] = useState(mockSchedule);
  const [stops, setStops] = useState(mockStops);

  const currentStop = stops[stopIdx];
  const nextStop = stops[stopIdx + 1];
  
  // Tính toán khoảng cách động và thời gian dự kiến
  const calculateRemainingDistance = () => {
    if (!nextStop || status === "completed") return "0 km";
    
    // Sử dụng vị trí bus hiện tại nếu có, nếu không thì dùng điểm dừng hiện tại
    const fromLat = busCurrentPosition?.lat || currentStop?.lat || stops[0]?.lat;
    const fromLng = busCurrentPosition?.lng || currentStop?.lng || stops[0]?.lng;
    const toLat = nextStop.lat;
    const toLng = nextStop.lng;
    
    if (!fromLat || !fromLng || !toLat || !toLng) return "1.2 km"; // fallback
    
    // Công thức Haversine để tính khoảng cách thực tế
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (toLat - fromLat) * Math.PI / 180;
    const dLng = (toLng - fromLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 0.1 ? "< 0.1 km" : `${distance.toFixed(1)} km`;
  };

  const calculateEstimatedTime = () => {
    if (!nextStop || status === "completed") return schedule.endTime;
    
    // Luôn trả về thời gian theo lịch trình để demo nhất quán (6h-7h)
    return nextStop.time;
  };

  const remainingDistance = calculateRemainingDistance();
  const estimatedTime = nextStop ? calculateEstimatedTime() : schedule.endTime;
  
  // Hiển thị thông tin trạng thái chi tiết
  const getDetailedStatus = () => {
    if (status === "not_started") return "Chưa khởi hành";
    if (status === "completed") return "Đã hoàn thành";
    if (pausedWpIdx !== null) return `Đang dừng tại ${stops[pausedWpIdx]?.name}`;
    return "Đang di chuyển";
  };
  useEffect(() => {
    const loadStudent = async () => {

      const list = await studentsService.getAllStudents();

      let current = 0;

      const newStops = mockStops.map((stop) => {
        if (stop.isStartOrEnd) {
          return { ...stop, students: [] };
        }

        const student = list.slice(current, current + 2);
        current += 2;

        return {
          ...stop, 
          students: student 
        };
      });
      
      // Tính tổng số học sinh thực tế được gán cho các điểm dừng
      const totalAssignedStudents = newStops.reduce((total, stop) => total + stop.students.length, 0);
      
      setStops(newStops); 
      setSchedule(prev => ({ 
          ...prev, 
          totalStudents: totalAssignedStudents 
      }));
    };
    loadStudent();

  }, [mockStops]); 

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handlers
  const startTrip = () => {
    setStatus("in_progress");
    pushNotice("success", "Đã bắt đầu chuyến đi!");
    
    // Lưu trạng thái để parent biết
    localStorage.setItem('busStatus', JSON.stringify({
      status: 'in_progress',
      currentStop: stopIdx,
      startTime: new Date().toLocaleTimeString('vi-VN'),
      startTimestamp: Date.now()
    }));
  };

  const confirmArrival = () => {
    if (!pickedAllAt(stopIdx)) {
      pushNotice("error", " Chưa đón đủ học sinh tại điểm này");
      return;
    }

    if (resumeFn) resumeFn();

    pushNotice("success", ` Đã đón xong tại ${currentStop.name}`);

    if (stopIdx === stops.length - 1) {
      pushNotice("success", " Đã hoàn thành tuyến đường");
      setStatus("completed");
      // Cập nhật trạng thái hoàn thành
      localStorage.setItem('busStatus', JSON.stringify({
        status: 'completed',
        currentStop: stopIdx,
        completedTime: new Date().toLocaleTimeString('vi-VN')
      }));
    } else {
      // Cập nhật trạng thái tiếp tục với timestamp để parent tạo lại animation
      localStorage.setItem('busStatus', JSON.stringify({
        status: 'in_progress',
        currentStop: stopIdx + 1,
        lastUpdate: new Date().toLocaleTimeString('vi-VN'),
        resumeTimestamp: Date.now() // Để parent biết cần tạo lại animation
      }));
    }

    setPausedWpIdx(null);
    setResumeFn(null);
    setShowArrival(false);
    setShowStudents(false);
  };

  const submitIncident = async () => {
    if (incidentMsg.trim()) {
      try {
        // Gửi sự cố lên database thông qua API
        const notificationData = {
          driver_id: 1, // TODO: Lấy driver_id thực tế từ session/auth
          schedule_id: scheduleId ? parseInt(scheduleId) : null, // Parse và handle null
          type: 'incident',
          title: 'Thông báo sự cố',
          message: incidentMsg,
          route_name: schedule.routeName
        };

        console.log('Sending notification data:', notificationData);
        await notificationsService.createNotification(notificationData);
        
        pushNotice("success", ` Đã gửi báo cáo sự cố: ${incidentMsg}`);
        setIncidentMsg("");
        setShowIncident(false);
      } catch (error) {
        console.error('Lỗi khi gửi thông báo sự cố:', error);
        pushNotice("error", ` Lỗi khi gửi báo cáo sự cố. Vui lòng thử lại.`);
      }
    }
  };

  const confirmEndTrip = () => {
    setStatus("completed");
    setTracking(false);
    pushNotice("success", " Đã kết thúc chuyến đi");
    setShowEndTrip(false);
    setTimeout(() => navigate("/driver/schedule"), 2000);
  };

  const toggleStudentStatus = (stopId, studentId) => {
    setStops((prev) =>
      prev.map((stop) => {
        if (stop.id !== stopId) return stop;
        return {
          ...stop,
          students: stop.students.map((stu) => {
            if (stu.id !== studentId) return stu;
            if (stu.status === "picked_up") return stu; // không revert
            const updated = { ...stu, status: "picked_up" };
            pushNotice("success", ` Đã đón ${updated.name}`);
            return updated;
          }),
        };
      })
    );
  };

  const markStudentAbsent = (stopId, studentId) => {
    setStops((prevStops) =>
      prevStops.map((stop) => {
        if (stop.id === stopId) {
          return {
            ...stop,
            students: stop.students.map((student) => {
              if (student.id === studentId) {
                const newStatus =
                  student.status === "absent" ? "waiting" : "absent";
                pushNotice(
                  "warning",
                  `${newStatus === "absent" ? " Vắng mặt" : " Có mặt"} ${
                    student.name
                  }`
                );
                return { ...student, status: newStatus };
              }
              return student;
            }),
          };
        }
        return stop;
      })
    );
  };

  const pushNotice = (type, message) => {
    const item = { id: Date.now(), type, message, time: new Date() };
    setNotices((prev) => [item, ...prev.slice(0, 4)]);
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      setNotices((prev) => prev.filter(notice => notice.id !== item.id));
    }, 3000);
  };

  const totalPicked = () => {
    return stops.reduce(
      (total, stop) =>
        total + stop.students.filter((s) => s.status === "picked_up").length,
      0
    );
  };

  const totalAbsent = () => {
    return stops.reduce(
      (total, stop) =>
        total + stop.students.filter((s) => s.status === "absent").length,
      0
    );
  };

  const remainingStudents = () => {
    return stops.reduce(
      (total, stop) =>
        total + stop.students.filter((s) => s.status === "waiting").length,
      0
    );
  };

  const pickedAllAt = (index) => {
    const stop = stops[index];
    if (!stop) return false;
    if (stop.students.length === 0) return true;
    return stop.students.every(
      (s) => s.status === "picked_up" || s.status === "absent"
    );
  };

  // Tuyến đường tuyến tính (không khép kín)
  const routeWaypoints = stops.map((s) => [s.lat, s.lng]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <DriverHeader
        schedule={schedule}
        currentTime={clock}
        isTracking={tracking}
        onBack={() => navigate("/driver/schedule")}
        onToggleTracking={() => setTracking(!tracking)}
        onOpenSettings={() => setShowEndTrip(true)}
      />
      <AlertsContainer alerts={notices} />

      {/* Map  */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MapContainer
            center={
              stops.length ? [stops[0].lat, stops[0].lng] : [10.76, 106.68]
            }
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {stops.map((s, i) => (
              <Marker key={s.id} position={[s.lat, s.lng]}>
                <Popup>
                  <strong>
                    {i === 0 ? "Điểm xuất phát" : `Điểm dừng ${i}`}
                  </strong>
                  <br />
                  {s.name}
                </Popup>
              </Marker>
            ))}

            {status === "in_progress" && stops.length > 0 && (
              <BusRoutePause
                waypoints={routeWaypoints}
                speedMetersPerSec={50}
                loop={false}
                onPositionUpdate={(position) => {
                  setBusCurrentPosition(position); // Cập nhật vị trí bus để tính khoảng cách chính xác
                }}
                onReachStop={(wpIdx, resumeFn) => {
                  setStopIdx(wpIdx);
                  setPausedWpIdx(wpIdx);
                  setResumeFn(() => resumeFn);
                  setShowStudents(true);
                  
                  // Cập nhật trạng thái dừng
                  localStorage.setItem('busStatus', JSON.stringify({
                    status: 'paused',
                    currentStop: wpIdx,
                    stopName: stops[wpIdx].name,
                    pausedTime: new Date().toLocaleTimeString('vi-VN')
                  }));
                  
                  pushNotice(
                    "warning",
                    `⚠️ Đã đến điểm dừng: ${stops[wpIdx].name} - chờ xác nhận`
                  );
                }}
              />
            )}
          </MapContainer>
        </div>

        <TripStatusPanel
          tripStatus={status}
          currentStopIndex={stopIdx}
          stops={stops}
          nextStop={nextStop}
          remainingDistance={remainingDistance}
          estimatedTime={estimatedTime}
          getRemainingStudents={remainingStudents}
        />

        {/* Floating Action Buttons */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
          {/* Start Trip Button */}
          {status === "not_started" && (
            <button
              onClick={startTrip}
              className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-all"
              title="Bắt đầu chuyến"
            >
              <FaPlay className="w-7 h-7" />
            </button>
          )}
          
          {/* Students Button */}
          {status !== "not_started" && (
            <button
              onClick={() => setShowStudents(true)}
              className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-all relative"
              title="Danh sách học sinh"
            >
              <FaUsers className="w-7 h-7" />
              {remainingStudents() > 0 && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {remainingStudents()}
                </div>
              )}
            </button>
          )}
          
          {/* Confirm Arrival Button */}
          {status !== "not_started" && pausedWpIdx !== null && (
            <button
              onClick={() => setShowArrival(true)}
              disabled={!pickedAllAt(stopIdx)}
              className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all transform hover:scale-105 ${
                pickedAllAt(stopIdx)
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              title={pickedAllAt(stopIdx) ? "Đã đón xong - tiếp tục" : "Cần đón đủ học sinh trước"}
            >
              <FaCheckCircle className="w-7 h-7" />
            </button>
          )}
          
          {/* Incident Report Button */}
          <button
            onClick={() => setShowIncident(true)}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-all"
            title="Báo cáo sự cố"
          >
            <FaExclamationTriangle className="w-7 h-7" />
          </button>
          
          {/* Emergency Call Button */}
          <button
            onClick={() => window.open("tel:1900-1234")}
            className="w-16 h-16 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-all"
            title="Liên hệ khẩn cấp"
          >
            <FaPhone className="w-7 h-7" />
          </button>
        </div>

        {/* Modals */}
        <ArrivalConfirmModal
          isOpen={showArrival}
          currentStop={currentStop}
          allStudentsPickedUp={pickedAllAt(stopIdx)}
          onConfirm={confirmArrival}
          onCancel={() => setShowArrival(false)}
        />

        <IncidentReportModal
          isOpen={showIncident}
          incidentText={incidentMsg}
          onIncidentTextChange={setIncidentMsg}
          onSubmit={submitIncident}
          onClose={() => setShowIncident(false)}
        />

        <EndTripModal
          isOpen={showEndTrip}
          routeName={schedule.routeName}
          onConfirm={confirmEndTrip}
          onCancel={() => setShowEndTrip(false)}
        />

        {/* Students Panel */}
        <StudentsPanel
          isOpen={showStudents}
          stops={stops}
          currentStopIndex={stopIdx}
          pausedWaypointIdx={pausedWpIdx}
          busNumber={schedule.busNumber}
          totalStudents={schedule.totalStudents}
          getTotalPickedUp={totalPicked}
          getTotalAbsent={totalAbsent}
          getRemainingStudents={remainingStudents}
          allStudentsPickedUp={pickedAllAt(stopIdx)}
          toggleStudentStatus={toggleStudentStatus}
          markStudentAbsent={markStudentAbsent}
          onClose={() => setShowStudents(false)}
          onConfirmArrival={confirmArrival}
        />
      </div>
    </div>
  );
}
