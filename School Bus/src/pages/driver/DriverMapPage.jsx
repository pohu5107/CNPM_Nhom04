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

  // Mock schedule & stops; only students fetched from API
  const mockSchedule = {
    id: scheduleId || 1,
    routeName: "Tuyến Quận 1 - Sáng",
    busNumber: "BUS-04",
    startTime: "06:30",
    endTime: "07:30",
    totalStudents: 0,
  };

  const mockStops = useMemo(
    () => [
      {
        id: 1,
        name: "Nhà Văn hóa Thanh Niên",
        time: "06:30",
        lat: 10.75875,
        lng: 106.68095,
        students: [],
        isStartOrEnd: true,
      },
      {
        id: 2,
        name: "Nguyễn Văn Cừ",
        time: "06:40",
        lat: 10.76055,
        lng: 106.6834,
        students: [],
      },
      {
        id: 3,
        name: "Nguyễn Biểu",
        time: "06:50",
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
  const remainingDistance = "1.2 km";
  const estimatedTime = nextStop ? nextStop.time : schedule.endTime;
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
      setStops(newStops); 
      setSchedule(prev => ({ 
          ...prev, 
          totalStudents: list.length 
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
  };

  const confirmArrival = () => {
    if (!pickedAllAt(stopIdx)) {
      pushNotice("error", "⚠️ Chưa đón đủ học sinh tại điểm này");
      return;
    }

    if (resumeFn) resumeFn();

    pushNotice("success", `✅ Đã đón xong tại ${currentStop.name}`);

    if (stopIdx === stops.length - 1) {
      pushNotice("success", "🏁 Đã hoàn thành tuyến đường");
      setStatus("completed");
    }

    setPausedWpIdx(null);
    setResumeFn(null);
    setShowArrival(false);
    setShowStudents(false);
  };

  const submitIncident = () => {
    if (incidentMsg.trim()) {
      pushNotice("error", `🚨 Đã gửi báo cáo sự cố: ${incidentMsg}`);
      setIncidentMsg("");
      setShowIncident(false);
    }
  };

  const confirmEndTrip = () => {
    setStatus("completed");
    setTracking(false);
    pushNotice("success", "🏁 Đã kết thúc chuyến đi");
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
            pushNotice("success", `✅ Đã đón ${updated.name}`);
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
                  `${newStatus === "absent" ? "❌ Vắng mặt" : "⏳ Có mặt"} ${
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
                onReachStop={(wpIdx, resumeFn) => {
                  setStopIdx(wpIdx); // Cập nhật trạng thái hiện tại ngay khi đến
                  setPausedWpIdx(wpIdx);
                  setResumeFn(() => resumeFn);
                  setShowStudents(true);
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
        <FloatingActionButtons
          tripStatus={status}
          pausedWaypointIdx={pausedWpIdx}
          allStudentsPickedUp={pickedAllAt(stopIdx)}
          getRemainingStudents={remainingStudents}
          onStartTrip={startTrip}
          onOpenStudents={() => setShowStudents(true)}
          onConfirmArrival={() => setShowArrival(true)}
          onReportIncident={() => setShowIncident(true)}
          onEmergencyCall={() => window.open("tel:1900-1234")}
        />

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
