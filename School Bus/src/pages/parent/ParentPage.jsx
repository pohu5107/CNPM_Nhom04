import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Simple MapPin SVG Icon component
const MapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// --- ICONS ---
// Fix for default marker icon
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
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
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

/// --- PLACEHOLDER DATA ---

const tripStatusData = {
  status: 'late',  
  nextStop: 'Trường THCS Nguyễn Du',
  eta: '20 phút',
  incident: 'Kẹt xe nghiêm trọng tại khu vực trung tâm.',
  passedStops: ['Công viên 23/9', 'Nhà Văn hóa Thanh Niên'],
};

const studentInfo = {
  name: 'Trần Dũng Minh',
  class: '6A1',
};

const busInfo = {
  busNumber: '51K-123.45',
  route: 'Tuyến Quận 1 - Sáng',
  driverName: 'Nguyễn Văn A',
  driverPhone: '0901234567',
};

const busLocation = [10.787, 106.705];
const schoolLocation = [10.790, 106.715];
const mapCenter = [10.787, 106.710];
const defaultZoom = 14;
const recenterZoom = 18;

// --- HELPER COMPONENTS ---

const TripStatusCard = ({ statusInfo }) => {
  const isLate = (statusInfo.status || '').toLowerCase() === 'late';
  const cardStyle = isLate ? 'bg-red-100 border-l-4 border-red-500 text-red-800' : 'bg-blue-100 border-l-4 border-blue-500 text-blue-800';
  const eta = isLate ? statusInfo.eta : '5 phút';
  const etaNumber = eta.split(' ')[0]; 

  return (
  <div className={`p-6 rounded-lg shadow-md ${cardStyle}`}>
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
      {/* CỘT 1: Trạng thái & Trạm kế tiếp */}
      <div className="md:flex-1">
        <h2 className="text-xl font-bold mb-4">Trạng thái chuyến đi</h2>
        {isLate && <div className="font-bold text-lg mb-4">CẢNH BÁO: XE ĐẾN TRỄ</div>}
        
        <div className="space-y-2 text-sm">
          <p><strong>Trạm kế tiếp:</strong> {statusInfo.nextStop}</p>
          {isLate && <p><strong>Lý do trễ:</strong> {statusInfo.incident}</p>}
        </div>
      </div>

      {/* CỘT 2: Các trạm đã đi qua */}
      <div className="md:flex-1">
        <h3 className="font-semibold text-base mb-2">Các trạm đã đi qua:</h3>
        <ul className="list-disc list-inside mt-1 text-sm text-gray-700">
          {statusInfo.passedStops.map((stop, index) => <li key={index}>{stop}</li>)}
        </ul>
      </div>

      {/* CỘT 3: Thời gian dự kiến (ETA) */}
      <div className="md:flex-1 text-center">
        <div className="text-sm text-gray-500 font-medium">
          {isLate ? 'Dự kiến trễ' : 'Dự kiến đến trong'}
        </div>
        <div className={`text-5xl font-bold ${isLate ? 'text-red-600' : 'text-green-600'}`}>
          {etaNumber}
        </div>
        <div className="text-lg text-gray-600 font-medium">phút</div>
      </div>

    </div>
  </div>
  );
};

function RecenterButton() {
  const map = useMap();
  const handleClick = () => map.flyTo(busLocation, recenterZoom);
  return (
    <button onClick={handleClick} className="absolute bottom-5 right-5 z-[1000] w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400" title="Tìm vị trí xe buýt">
      <MapPin className="w-6 h-6" />
    </button>
  );
}

// --- MAIN PARENT PAGE COMPONENT ---

const ParentPage = () => {
  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Trang thông tin cho Phụ Huynh</h1>
      <div className="flex flex-col gap-6">
        {/* 1. Trip Status */}
        <TripStatusCard statusInfo={tripStatusData} />

        {/* 2. Map View */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Bản đồ theo dõi xe buýt</h2>
            {(tripStatusData.status || '').toLowerCase() === 'late' && (
              <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                Cảnh báo xe đến trễ
              </span>
            )}
          </div>
          <div className="w-full h-[600px] relative rounded-lg overflow-hidden border">
            <MapContainer center={mapCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={busLocation} icon={busLocationIcon}><Popup>Vị trí hiện tại của xe buýt.</Popup></Marker>
              <Marker position={schoolLocation} icon={schoolIcon}><Popup>Trường học.</Popup></Marker>
              <RecenterButton />
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
        </div>        {/* 4. Bus Information */}
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