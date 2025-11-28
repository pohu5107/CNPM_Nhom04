import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BusRouteParentPause from '../../components/map/BusRouteParentPause.jsx';
import { notificationsService } from '../../services/notificationsService.js';
import { AlertTriangle } from 'lucide-react';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Simple MapPin SVG Icon component
const MapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// --- ICONS ---
// Fix for default marker icon
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const busLocationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Red location pin
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const schoolIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2602/2602414.png', // School icon
  iconSize: [35, 35],
  iconAnchor: [17, 45],
  popupAnchor: [0, -35],
});

const pickupIcon = new L.Icon({
  // Hình cột biển báo xe buýt
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

/// --- DATA ---

const studentInfo = {
  name: 'Lâm Xuân Mai',
  class: '7A1',
};

const busInfo = {
  busNumber: '51K-123.45',
  route: 'Tuyến Quận 1 - Sáng',
  driverName: 'Nguyễn Văn A',
  driverPhone: '0901234567',
};

// Sử dụng cùng tuyến đường với driver
const mockStops = [
  {
    id: 1,
    name: "Nhà Văn hóa Thanh Niên",
    time: "06:00",
    lat: 10.75875,
    lng: 106.68095,
    isStartOrEnd: true,
  },
  {
    id: 2,
    name: "Nguyễn Văn Cừ", 
    time: "06:20",
    lat: 10.76055,
    lng: 106.6834,
  },
  {
    id: 3,
    name: "Nguyễn Biểu",
    time: "06:40", 
    lat: 10.7579,
    lng: 106.6831,
  },
  {
    id: 4,
    name: "Trường THCS Nguyễn Du",
    time: "07:00",
    lat: 10.7545,
    lng: 106.6815,
    isStartOrEnd: true,
  },
];

const mapCenter = [10.76, 106.68];
const defaultZoom = 16;

// --- HELPER COMPONENTS ---

const TripStatusCard = ({ busStatus, currentStop }) => {
  const getStatusText = () => {
    // Nếu chưa có thông tin từ driver thì hiển thị "Chưa bắt đầu"
    if (!busStatus) return 'Chưa bắt đầu';
    
    if (busStatus?.status === 'completed') return 'Đã hoàn thành chuyến';
    if (busStatus?.status === 'paused') return `Đang dừng tại ${busStatus.stopName || currentStop?.name}`;
    if (busStatus?.status === 'in_progress') return 'Đang di chuyển';
    return 'Chưa bắt đầu';
  };

  const getStatusColor = () => {
    // Nếu chưa có thông tin từ driver thì hiển thị màu xám
    if (!busStatus) return 'bg-gray-100 border-l-4 border-gray-500 text-gray-800';
    
    if (busStatus?.status === 'completed') return 'bg-green-100 border-l-4 border-green-500 text-green-800';
    if (busStatus?.status === 'paused') return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800';
    if (busStatus?.status === 'in_progress') return 'bg-blue-100 border-l-4 border-blue-500 text-blue-800';
    return 'bg-gray-100 border-l-4 border-gray-500 text-gray-800';
  };

  const getProgressInfo = () => {
    if (!busStatus) return '0/4 điểm dừng'; // Chưa bắt đầu
    
    const currentStopIndex = busStatus.currentStop || 0;
    const totalStops = 4; // Theo mockStops
    
    // Hiển thị tiến độ thực tế: điểm dừng hiện tại / tổng số điểm
    const displayCurrentStop = currentStopIndex + 1; // +1 vì index bắt đầu từ 0
    return `${displayCurrentStop}/${totalStops} điểm dừng`;
  };

  return (
    <div className={`p-6 rounded-lg shadow-md ${getStatusColor()}`}>
      <h2 className="text-xl font-bold mb-4">Trạng thái chuyến đi</h2>
      <div className="space-y-2 text-sm">
        <p><strong>Trạng thái:</strong> {getStatusText()}</p>
        <p><strong>Điểm dừng hiện tại:</strong> {currentStop?.name || 'Nhà Văn hóa Thanh Niên'}</p>
        <p><strong>Tiến độ:</strong> {getProgressInfo()}</p>

      </div>
    </div>
  );
};

// Component hiển thị thông báo sự cố
const IncidentAlert = ({ incident, onClose }) => (
  <div 
    className="fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-2xl z-[9999] max-w-sm cursor-pointer transform transition-all duration-500 animate-bounce"
    onClick={onClose}
    style={{ zIndex: 10000 }}
  >
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl animate-pulse"></span>
          <h4 className="font-bold text-lg">CẢNH BÁO SỰ CỐ!</h4>
        </div>
        <p className="text-sm mb-2 font-medium">{incident.message}</p>
        <p className="text-xs opacity-90 mb-1">
          {incident.route} | {incident.time}
        </p>
        <p className="text-xs opacity-75">Nhấn để đóng</p>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="text-white hover:text-gray-200 ml-2 text-xl font-bold bg-red-800 rounded-full w-8 h-8 flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  </div>
);

// --- MAIN PARENT PAGE COMPONENT ---

const ParentPage = () => {
  const [busStatus, setBusStatus] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [showIncidentAlert, setShowIncidentAlert] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [viewedIncidentIds, setViewedIncidentIds] = useState(new Set()); // Track viewed incidents
  const [isFirstLoad, setIsFirstLoad] = useState(true); // Track first load

  // Tuyến đường giống driver
  const routeWaypoints = useMemo(() => mockStops.map((s) => [s.lat, s.lng]), []);
  
  // Tự động xóa localStorage cũ khi component mount lần đầu
  useEffect(() => {
    const clearOldData = () => {
      const status = localStorage.getItem('busStatus');
      if (status) {
        try {
          const parsed = JSON.parse(status);
          const now = Date.now();
          const dataAge = now - (parsed.startTimestamp || parsed.resumeTimestamp || now);
          
          // Nếu dữ liệu quá cũ (hơn 1 phút) hoặc status là completed, xóa luôn
          if (dataAge > 60000 || parsed.status === 'completed') {
            localStorage.removeItem('busStatus');
            console.log('👨‍👩‍👧‍👦 Parent: Cleared old localStorage data');
          }
        } catch (e) {
          // Dữ liệu lỗi - xóa luôn
          localStorage.removeItem('busStatus');
          console.log('👨‍👩‍👧‍👦 Parent: Cleared corrupted localStorage data');
        }
      }
    };
    
    clearOldData();
  }, []); // Chỉ chạy một lần khi component mount
  
  // Lấy trạng thái từ localStorage với cập nhật thông minh - chỉ khi driver thực sự đang chạy
  useEffect(() => {
    const checkBusStatus = () => {
      const status = localStorage.getItem('busStatus');
      if (status) {
        try {
          const parsed = JSON.parse(status);
          
          // Kiểm tra xem dữ liệu có quá cũ không (hơn 30 giây)
          const now = Date.now();
          const dataAge = now - (parsed.startTimestamp || parsed.resumeTimestamp || now);
          const isDataFresh = dataAge < 30000; // 30 giây
          
          // Chỉ cập nhật nếu:
          // 1. Dữ liệu còn tươi (không quá cũ)
          // 2. Driver đang thực sự chạy (in_progress hoặc paused)
          // 3. Có thay đổi thực sự
          if (isDataFresh && 
              (parsed.status === 'in_progress' || parsed.status === 'paused' || parsed.status === 'completed')) {
            setBusStatus(prevStatus => {
              if (!prevStatus || 
                  prevStatus.status !== parsed.status ||
                  prevStatus.currentStop !== parsed.currentStop ||
                  prevStatus.startTime !== parsed.startTime ||
                  prevStatus.lastUpdate !== parsed.lastUpdate ||
                  prevStatus.pausedTime !== parsed.pausedTime ||
                  prevStatus.resumeTimestamp !== parsed.resumeTimestamp) {
                console.log('👨‍👩‍👧‍👦 Parent: Bus status changed:', parsed);
                return parsed;
              }
              return prevStatus;
            });
          } else if (!isDataFresh) {
            // Dữ liệu quá cũ - reset về null
            setBusStatus(null);
            console.log('👨‍👩‍👧‍👦 Parent: Clearing old bus status data');
          }
        } catch (e) {
          console.warn('Error parsing bus status:', e);
        }
      } else {
        // Không có dữ liệu localStorage - reset về null
        setBusStatus(null);
      }
    };

    checkBusStatus();
    const interval = setInterval(checkBusStatus, 1000); // Check mỗi 1 giây
    return () => clearInterval(interval);
  }, []);

  // Lấy thông báo sự cố từ API - chỉ dùng API, không localStorage
  useEffect(() => {
    const checkIncidents = async () => {
      try {
        const apiNotifications = await notificationsService.getLatestNotifications(1);
        if (apiNotifications.length > 0) {
          const latestNotification = apiNotifications[0];
          
          // Chuyển đổi format từ API
          const formattedIncident = {
            id: latestNotification.id,
            message: latestNotification.message,
            time: new Date(latestNotification.created_at).toLocaleTimeString('vi-VN'),
            route: latestNotification.route_name || 'Tuyến Quận 1 - Sáng'
          };
          
          // Chỉ hiển thị nếu:
          // 1. Không phải lần đầu load (để tránh hiện thông báo cũ)
          // 2. Chưa từng xem thông báo này
          // 3. Khác với thông báo hiện tại
          if (!isFirstLoad && 
              !viewedIncidentIds.has(formattedIncident.id) && 
              formattedIncident.id !== currentIncident?.id) {
            setCurrentIncident(formattedIncident);
            setShowIncidentAlert(true);
            
            // Thêm vào danh sách đã xem
            setViewedIncidentIds(prev => new Set([...prev, formattedIncident.id]));
            
            setTimeout(() => {
              setShowIncidentAlert(false);
            }, 5000);
          } else if (isFirstLoad) {
            // Lần đầu load: đánh dấu tất cả thông báo hiện tại là đã xem
            setViewedIncidentIds(prev => new Set([...prev, formattedIncident.id]));
            setIsFirstLoad(false);
          }
        } else if (isFirstLoad) {
          setIsFirstLoad(false);
        }
      } catch (error) {
        console.warn('Lỗi khi kiểm tra thông báo từ API:', error);
        if (isFirstLoad) {
          setIsFirstLoad(false);
        }
      }
    };

    checkIncidents();
    const interval = setInterval(checkIncidents, 3000); // Check mỗi 3 giây
    return () => clearInterval(interval);
  }, [currentIncident, isFirstLoad, viewedIncidentIds]);

  // Tính toán currentStop dựa trên busStatus
  const currentStop = useMemo(() => {
    if (!busStatus || busStatus.currentStop === undefined) {
      return mockStops[0]; // Mặc định điểm đầu
    }
    const stopIndex = Math.min(busStatus.currentStop, mockStops.length - 1);
    return mockStops[stopIndex];
  }, [busStatus]);
  const isDriverRunning = busStatus?.status === 'in_progress';

  // Tự động cập nhật giao diện khi có thay đổi từ driver
  useEffect(() => {
    // Force re-render component khi busStatus thay đổi
    if (busStatus) {
      console.log('📱 Parent: Bus status updated:', busStatus);
    }
  }, [busStatus]);

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Trang thông tin cho Phụ Huynh</h1>
      

      
      {/* Thông báo sự cố nổi */}
      {showIncidentAlert && currentIncident && (
        <IncidentAlert 
          incident={currentIncident}
          onClose={() => setShowIncidentAlert(false)}
        />
      )}
      
      <div className="flex flex-col gap-6">




        {/* 1. Trip Status */}
        <TripStatusCard busStatus={busStatus} currentStop={currentStop} />

        {/* 2. Map View */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Bản đồ theo dõi xe buýt</h2>
          <div className="w-full h-[600px] relative rounded-lg overflow-hidden border">
            <MapContainer 
              center={routeWaypoints[0] || mapCenter} 
              zoom={defaultZoom} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer 
                attribution='&copy; OpenStreetMap' 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
              />

              {/* Hiển thị các điểm dừng */}
              {mockStops.map((stop, index) => (
                <Marker key={stop.id} position={[stop.lat, stop.lng]}>
                  <Popup>
                    <strong>{stop.name}</strong>
                    <br />Thời gian: {stop.time}
                    <br />Trạng thái: {
                      busStatus?.currentStop > index ? 'Đã qua' : 
                      busStatus?.currentStop === index ? 'Hiện tại' : 'Chưa tới'
                    }
                  </Popup>
                </Marker>
              ))}


              
              {/* Bus Route Animation cho Parent */}
              {busStatus && (
                <BusRouteParentPause
                  key={`parent-bus-${busStatus.startTimestamp || busStatus.resumeTimestamp || busStatus.startTime || Date.now()}`}
                  waypoints={routeWaypoints}
                  speedMetersPerSec={18}
                  busStatus={busStatus}
                  onPositionUpdate={(position) => {
                    // Track bus position for parent
                  }}
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* 3. Student Information */}
        <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Thông tin học sinh</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-700">
            <p><strong>Họ và tên:</strong> {studentInfo.name}</p>
            <p><strong>Lớp:</strong> {studentInfo.class}</p>
          </div>
        </div>
        
        {/* 4. Bus Information */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-5">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Thông tin xe buýt</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-700">
            <p><strong>Số xe:</strong> {busInfo.busNumber}</p>
            <p><strong>Tuyến đường:</strong> {busInfo.route}</p>
            <p><strong>Tài xế:</strong> {busInfo.driverName}</p>
            <p><strong>SĐT Tài xế:</strong> {busInfo.driverPhone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentPage;