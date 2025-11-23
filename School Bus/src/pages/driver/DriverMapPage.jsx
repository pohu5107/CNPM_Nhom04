import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  MapPin, Clock, Users, Bus, ArrowLeft, Settings, 
  AlertTriangle, CheckCircle, XCircle, Phone, 
  Navigation, Send, X, LogOut, Play
} from 'lucide-react';
import DriverMapView from '../../components/driver/DriverMapView';

export default function DriverMapPage() {
  const navigate = useNavigate();
  const { scheduleId } = useParams(); // Lấy scheduleId từ URL params
  
  // States chính
  const [tripStatus, setTripStatus] = useState('not_started'); // Bắt đầu từ not_started
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStudentsPanel, setShowStudentsPanel] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [showEndTripModal, setShowEndTripModal] = useState(false);
  const [incidentText, setIncidentText] = useState('');
  const [isTracking, setIsTracking] = useState(true);

 
  const mockSchedule = {
    id: scheduleId || 1,
    routeName: "Tuyến Quận 1 - Sáng",
    routeCode: "T001",
    busNumber: "BUS-04",
    startTime: "06:30",
    endTime: "07:30",
    driverName: "Nguyễn Văn A",
    totalStudents: 5,
    currentLocation: "Nhà Văn hóa Thanh Niên"
  };

  const mockStops = [
    {
      id: 1,
      name: "Nhà Văn hóa Thanh Niên",
      time: "06:30",
      students: [
        { id: 1, name: "Trần Dũng Minh", class: "6A1", phone: "0987654321", status: "picked_up" },
        { id: 2, name: "Nguyễn Thị Mai", class: "6A2", phone: "0987654322", status: "picked_up" }
      ]
    },
    {
      id: 2,
      name: "Ngã tư Hàng Xanh",
      time: "06:40",
      students: [
        { id: 3, name: "Lê Văn Hoàng", class: "7B1", phone: "0987654323", status: "waiting" },
        { id: 4, name: "Phạm Thị Lan", class: "6A3", phone: "0987654324", status: "waiting" }
      ]
    },
    {
      id: 3,
      name: "Trường THCS Nguyễn Du",
      time: "07:00",
      students: [
        { id: 5, name: "Hoàng Văn Nam", class: "7A1", phone: "0987654325", status: "waiting" }
      ]
    }
  ];

  const [stops, setStops] = useState(mockStops);

  // Mock thông tin tracking hiện tại
  const currentStop = stops[currentStopIndex];
  const nextStop = stops[currentStopIndex + 1];
  const remainingDistance = "1.2 km";
  const estimatedTime = nextStop ? nextStop.time : mockSchedule.endTime;

  // Cập nhật thời gian real-time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

 

  // Bắt đầu chuyến
  const startTrip = () => {
    setTripStatus('in_progress');
    addAlert('success', 'Đã bắt đầu chuyến đi!');
  };

  // Xác nhận đến điểm dừng
  const confirmArrival = () => {
    if (currentStopIndex < stops.length - 1) {
      setCurrentStopIndex(prev => prev + 1);
      addAlert('success', ` Đã đến ${currentStop.name}`);
    } else {
      // Đã đến điểm cuối
      addAlert('success', '🏁 Đã hoàn thành tuyến đường');
      setTripStatus('completed');
    }
    setShowArrivalModal(false);
  };

  // Báo cáo sự cố
  const submitIncident = () => {
    if (incidentText.trim()) {
      addAlert('error', ` Đã gửi báo cáo sự cố: ${incidentText}`);
      setIncidentText('');
      setShowIncidentModal(false);
      // TODO: Gửi API báo cáo sự cố
    }
  };

  // Kết thúc chuyến
  const confirmEndTrip = () => {
    setTripStatus('completed');
    setIsTracking(false);
    addAlert('success', ' Đã kết thúc chuyến đi');
    setShowEndTripModal(false);
    // TODO: API cập nhật trạng thái chuyến
    setTimeout(() => {
      navigate('/driver/schedule'); // Quay về danh sách lịch
    }, 2000);
  };

  // Chức năng quản lý học sinh
  const toggleStudentStatus = (stopId, studentId) => {
    setStops(prevStops => 
      prevStops.map(stop => {
        if (stop.id === stopId) {
          return {
            ...stop,
            students: stop.students.map(student => {
              if (student.id === studentId) {
                const newStatus = student.status === 'picked_up' ? 'waiting' : 'picked_up';
                addAlert('success', `${newStatus === 'picked_up' ? ' Đã đón' : '⏳ Chưa đón'} ${student.name}`);
                return { ...student, status: newStatus };
              }
              return student;
            })
          };
        }
        return stop;
      })
    );
  };

  const markStudentAbsent = (stopId, studentId) => {
    setStops(prevStops => 
      prevStops.map(stop => {
        if (stop.id === stopId) {
          return {
            ...stop,
            students: stop.students.map(student => {
              if (student.id === studentId) {
                const newStatus = student.status === 'absent' ? 'waiting' : 'absent';
                addAlert('warning', `${newStatus === 'absent' ? ' Vắng mặt' : '⏳ Có mặt'} ${student.name}`);
                return { ...student, status: newStatus };
              }
              return student;
            })
          };
        }
        return stop;
      })
    );
  };

  // Utility functions
  const addAlert = (type, message) => {
    const newAlert = { id: Date.now(), type, message, time: new Date() };
    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
  };

  const getTotalPickedUp = () => {
    return stops.reduce((total, stop) => 
      total + stop.students.filter(s => s.status === 'picked_up').length, 0
    );
  };

  const getTotalAbsent = () => {
    return stops.reduce((total, stop) => 
      total + stop.students.filter(s => s.status === 'absent').length, 0
    );
  };

  const getRemainingStudents = () => {
    return stops.reduce((total, stop) => 
      total + stop.students.filter(s => s.status === 'waiting').length, 0
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/*  HEADER TOPBAR - Sticky  */}
      <div className="bg-white shadow-lg border-b z-40 relative flex-shrink-0 sticky top-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left section - Navigation & Trip Info */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/driver/schedule')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Quay lại danh sách chuyến"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  isTracking ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <div className="font-bold text-lg text-gray-900">
                    {mockSchedule.routeName} • {mockSchedule.busNumber}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-4">
                    <span>Mã chuyến: #{mockSchedule.id}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mockSchedule.startTime} - {mockSchedule.endTime}
                    </span>
                  
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right section - Time & Controls */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-mono font-semibold text-gray-900">
                  {currentTime.toLocaleTimeString('vi-VN')}
                </div>
               
              </div>

              {/* Pause/Resume button */}
              <button 
                onClick={() => setIsTracking(!isTracking)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isTracking 
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                title={isTracking ? "Tạm dừng tracking" : "Tiếp tục tracking"}
              >
                {isTracking ? '⏸️ Tạm dừng' : '▶️ Tiếp tục'}
              </button>
              
              <button 
                onClick={() => setShowEndTripModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cài đặt / Kết thúc ca"
              >
                <Settings className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

   
      {alerts.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {alerts.slice(0, 3).map(alert => (
            <div key={alert.id} className={`p-3 rounded-lg shadow-lg backdrop-blur-sm max-w-sm transition-all duration-300 ${
              alert.type === 'success' ? 'bg-green-100/95 text-green-800 border border-green-200' :
              alert.type === 'warning' ? 'bg-yellow-100/95 text-yellow-800 border border-yellow-200' :
              alert.type === 'error' ? 'bg-red-100/95 text-red-800 border border-red-200' :
              'bg-blue-100/95 text-blue-800 border border-blue-200'
            }`}>
              <div className="text-sm font-medium">{alert.message}</div>
              <div className="text-xs opacity-75">{alert.time.toLocaleTimeString('vi-VN')}</div>
            </div>
          ))}
        </div>
      )}

      {/*  MAIN MAP CONTAINER */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map wrapper with low z so overlays can sit above it */}
        <div className="absolute inset-0 z-0"> 
          <DriverMapView 
            routeId={1} 
            scheduleId={mockSchedule.id} 
            driverId={1}
          />
        </div>

        {/* STOP OVERLAY - Bottom Panel  */}
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 z-50 min-w-80 border border-gray-200">
          <div className="space-y-3">
            {/* Status & Progress */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  tripStatus === 'completed' ? 'bg-green-500' : 
                  tripStatus === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></div>
                <span className="font-semibold text-gray-800">
                  {tripStatus === 'completed' ? '🏁 Chuyến đã hoàn thành' : 
                   tripStatus === 'in_progress' ? '🚍 Đang trong chuyến' : 
                   '⏳ Chờ bắt đầu chuyến'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {currentStopIndex + 1}/{stops.length} điểm
              </div>
            </div>

            {/* Pre-trip Status - hiển thị khi chưa bắt đầu */}
            {tripStatus === 'not_started' ? (
              <div className="text-center py-4">
                <div className="text-gray-600 mb-2">
                  🚀 Sẵn sàng bắt đầu chuyến đi
                </div>
                <div className="text-sm text-gray-500">
                  Nhấn nút "Bắt đầu chuyến" để khởi động
                </div>
              </div>
            ) : (
              <>
                {/* Next Stop Info - chỉ hiển thị khi đã bắt đầu */}
                {nextStop && tripStatus !== 'completed' ? (
              <>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="font-semibold text-gray-800">
                    Điểm tiếp theo: {nextStop.name}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    <span>→ Còn lại: {remainingDistance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Dự kiến: {estimatedTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm">
                  <Users className="w-3 h-3 text-orange-600" />
                  <span className="text-orange-600 font-medium">
                    🧑‍🎓 Học sinh còn lại: {getRemainingStudents()}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <div className="text-green-600 font-semibold">
                  {tripStatus === 'completed' ? '🏁 Đã hoàn thành tuyến' : ' Đã đến điểm cuối'}
                </div>
              </div>
            )}
          </>
        )}
            
        {/* Progress bar - chỉ hiển thị khi đã bắt đầu */}
            {tripStatus !== 'not_started' && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Tiến độ</span>
                  <span>{Math.round(((currentStopIndex + 1) / stops.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStopIndex + 1) / stops.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        
    

        {/* FLOATING ACTION BUTTONS - Góc phải dưới  */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
          {/* Nút Bắt đầu chuyến - chỉ hiện khi chưa bắt đầu */}
          {tripStatus === 'not_started' && (
            <button
              onClick={startTrip}
              className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-all shadow-green-200 pulse-animation"
              title="🚀 Bắt đầu chuyến"
            >
              <Play className="w-7 h-7" />
            </button>
          )}

          {/* 1️ Nút Danh sách học sinh - chỉ hiện khi đã bắt đầu */}
          {tripStatus !== 'not_started' && (
            <button
              onClick={() => setShowStudentsPanel(true)}
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

          {/* 2️ Nút Xác nhận đến điểm đón - chỉ hiện khi đã bắt đầu */}
          {tripStatus !== 'not_started' && (
            <button
              onClick={() => setShowArrivalModal(true)}
              disabled={!nextStop && tripStatus !== 'completed'}
              className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all transform hover:scale-105 ${
                nextStop || tripStatus !== 'completed'
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
              title={nextStop ? " Xác nhận đến điểm đón" : "Không có điểm đón tiếp theo"}
            >
              <CheckCircle className="w-7 h-7" />
            </button>
          )}

          {/* 3️Nút Báo sự cố */}
          <button
            onClick={() => setShowIncidentModal(true)}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-all shadow-red-200"
            title="⚠️ Báo cáo sự cố"
          >
            <AlertTriangle className="w-7 h-7" />
          </button>

          {/* 4️ Nút Liên hệ khẩn cấp */}
          <button
            onClick={() => window.open('tel:1900-1234')}
            className="w-16 h-16 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-all shadow-yellow-200"
            title="📞 Liên hệ khẩn cấp"
          >
            <Phone className="w-7 h-7" />
          </button>

       
        </div>

        {/*  POPUP: XÁC NHẬN ĐẾN ĐIỂM */}
        {showArrivalModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-70">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4 border shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Xác nhận đến điểm dừng</h3>
                <p className="text-gray-600 mb-6">
                  Bạn đã đến <strong className="text-gray-900">{currentStop?.name}</strong>?
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowArrivalModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmArrival}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP: BÁO SỰ CỐ */}
        {showIncidentModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-70">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4 w-full border shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Báo cáo sự cố</h3>
                </div>
                <button 
                  onClick={() => setShowIncidentModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick incident options */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Chọn nhanh loại sự cố:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { text: '🚗 Xe hỏng', value: 'Xe gặp sự cố kỹ thuật' },
                    { text: '🚦 Kẹt xe', value: 'Giao thông kẹt xe nghiêm trọng' },
                    { text: '👤 HS không đến', value: 'Học sinh không có mặt tại điểm đón' },
                    { text: '⚠️ Khẩn cấp', value: 'Tình huống khẩn cấp cần hỗ trợ ngay' }
                  ].map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setIncidentText(option.value)}
                      className="p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-red-300 transition-colors text-left"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
              
              <textarea
                value={incidentText}
                onChange={(e) => setIncidentText(e.target.value)}
                placeholder="Mô tả chi tiết tình huống sự cố (vị trí, mức độ nghiêm trọng...)"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={submitIncident}
                  disabled={!incidentText.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Gửi báo cáo
                </button>
              </div>
            </div>
          </div>
        )}

        {/*  POPUP: KẾT THÚC CHUYẾN */}
        {showEndTripModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-70">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4 border shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Kết thúc chuyến đi</h3>
                <p className="text-gray-600 mb-6">
                  Bạn có chắc chắn muốn kết thúc chuyến <strong className="text-gray-900">{mockSchedule.routeName}</strong>?
                  <br />
                  <span className="text-sm">Hành động này sẽ dừng việc theo dõi GPS.</span>
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowEndTripModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmEndTrip}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Kết thúc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* PANEL HỌC SINH - Trượt từ bên phải  */}
      {showStudentsPanel && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowStudentsPanel(false)}
          />
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Header panel */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Học sinh - {mockSchedule.busNumber}
                    </h3>
                    <div className="text-blue-100 text-sm mt-1">
                      {getTotalPickedUp()}/{mockSchedule.totalStudents} đã đón • {getRemainingStudents()} còn lại • {getTotalAbsent()} vắng
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStudentsPanel(false)}
                    className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Content panel */}
              <div className="flex-1 overflow-y-auto">
                {stops.map((stop, stopIndex) => (
                  <div key={stop.id} className="border-b border-gray-200">
                    {/* Stop header */}
                    <div className="bg-gray-50 px-4 py-3 sticky top-0 z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ${
                          stopIndex === currentStopIndex ? 'bg-blue-500' : 
                          stopIndex < currentStopIndex ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {stopIndex + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{stop.name}</div>
                          <div className="text-sm text-gray-500">{stop.time}</div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                          stopIndex === currentStopIndex ? 'bg-blue-100 text-blue-700' :
                          stopIndex < currentStopIndex ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {stopIndex === currentStopIndex ? 'Hiện tại' :
                           stopIndex < currentStopIndex ? 'Hoàn thành' : 'Chờ'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Students list */}
                    <div className="p-4 space-y-3">
                      {stop.students.map(student => (
                        <div key={student.id} className={`p-4 rounded-lg border-2 transition-all ${
                          student.status === 'picked_up' ? 'bg-green-50 border-green-200' :
                          student.status === 'absent' ? 'bg-red-50 border-red-200' :
                          'bg-white border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-600">{student.class}</div>
                              <div className="text-xs text-gray-500 mt-1 font-mono">{student.phone}</div>
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-3">
                              {/* Status indicator */}
                              {student.status === 'picked_up' ? (
                                <div className="text-green-600 text-sm font-medium flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  Đã đón
                                </div>
                              ) : student.status === 'absent' ? (
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
                              
                              {/* Action buttons */}
                              <div className="flex gap-1">
                                <button
                                  onClick={() => toggleStudentStatus(stop.id, student.id)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    student.status === 'picked_up' 
                                      ? 'bg-green-600 text-white' 
                                      : 'bg-gray-200 text-gray-600 hover:bg-green-600 hover:text-white'
                                  }`}
                                  title="Đánh dấu đã đón"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                
                                <button
                                  onClick={() => markStudentAbsent(stop.id, student.id)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    student.status === 'absent' 
                                      ? 'bg-red-600 text-white' 
                                      : 'bg-gray-200 text-gray-600 hover:bg-red-600 hover:text-white'
                                  }`}
                                  title="Đánh dấu vắng mặt"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                                
                                <button
                                  onClick={() => window.open(`tel:${student.phone}`)}
                                  className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-blue-600 hover:text-white transition-colors"
                                  title={`Gọi ${student.phone}`}
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
              
              {/* Footer panel - Summary với thống kê chi tiết */}
              <div className="bg-gray-50 p-4 border-t">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">📊 Tổng kết chuyến đi</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <div className="font-bold text-green-700 text-lg">{getTotalPickedUp()}</div>
                      <div className="text-green-600">Đã đón</div>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg">
                      <div className="font-bold text-red-700 text-lg">{getTotalAbsent()}</div>
                      <div className="text-red-600">Vắng mặt</div>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <div className="font-bold text-orange-700 text-lg">{getRemainingStudents()}</div>
                      <div className="text-orange-600">Chờ đón</div>
                    </div>
                  </div>
                </div>

                {/* Progress overview */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Tiến độ đón học sinh</span>
                    <span>{getTotalPickedUp()}/{mockSchedule.totalStudents} ({Math.round((getTotalPickedUp() / mockSchedule.totalStudents) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(getTotalPickedUp() / mockSchedule.totalStudents) * 100}%` }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => setShowStudentsPanel(false)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                   Đóng danh sách
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}