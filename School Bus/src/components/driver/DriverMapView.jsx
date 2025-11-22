import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { routesService } from '../../services/routesService';
import { schedulesService } from '../../services/schedulesService';



import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Icon cho các điểm dừng
const stopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Bus stop icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

export default function DriverMapView({ routeId, scheduleId, driverId }) {
  const [routeData, setRouteData] = useState(null);
  const [stops, setStops] = useState([]);
  const [routeLine, setRouteLine] = useState([]);
  const [mapCenter, setMapCenter] = useState([10.776, 106.700]); // Default HCM
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolvedRouteId, setResolvedRouteId] = useState(routeId || null);

  useEffect(() => {
    const fetchRouteData = async (rid) => {
      try {
        setLoading(true);
        setError(null);

        const response = await routesService.getRouteById(rid);
        const data = response;

        setRouteData(data);
        setStops(data.stops || []);

        if (data.route_geometry && data.route_geometry.length > 0) {
          setRouteLine(data.route_geometry);
          setMapCenter(data.route_geometry[0]);
        } else if (data.stops && data.stops.length > 0) {
          const firstStopCoords = [data.stops[0].latitude, data.stops[0].longitude];
          setMapCenter(firstStopCoords);
        }

      } catch (err) {
        setError('Không thể tải dữ liệu lộ trình.');
      } finally {
        setLoading(false);
      }
    };


    (async () => {
      try {
        setError(null);

        if (routeId) {
          setResolvedRouteId(routeId);
          await fetchRouteData(routeId);
          return;
        }

        if (scheduleId && driverId) {
          setLoading(true);
          const resp = await schedulesService.getScheduleStops(driverId, scheduleId);

          const stopsArr = Array.isArray(resp?.stops) ? resp.stops : [];
          setStops(stopsArr);

          if (stopsArr.length > 0) {
            const first = stopsArr[0];
            if (first?.latitude && first?.longitude) {
              setMapCenter([first.latitude, first.longitude]);
            }
          }

          if (resp?.routeId) {
            setResolvedRouteId(resp.routeId);
            await fetchRouteData(resp.routeId);
          } else {
            setResolvedRouteId(null);
            setLoading(false);
          }

          return;
        }


        setLoading(false);
      } catch (e) {
        setError('Không thể lấy dữ liệu lộ trình từ lịch trình.');
        setLoading(false);
      }
    })();

  }, [routeId, scheduleId, driverId]);

  if (loading) {
    return <div className="flex items-center justify-center h-full bg-gray-100"><p>Đang tải bản đồ...</p></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-full bg-red-50 text-red-600"><p>{error}</p></div>;
  }


  const hasGeometry = Array.isArray(routeLine) && routeLine.length > 0;
  const hasStops = Array.isArray(stops) && stops.length > 0;

  return (
    <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Vẽ đường đi của tuyến */}
      {routeLine.length > 0 && (
        <Polyline positions={routeLine} color="blue" weight={5} />
      )}

      {/* Đánh dấu các điểm dừng */}
      {stops.map((stop, index) => (
        <Marker
          key={stop.id || index}
          position={[stop.latitude, stop.longitude]}
          icon={stopIcon}
        >
          <Popup>
            <b>Điểm dừng {index + 1}: {stop.name}</b>
            <br />
            Địa chỉ: {stop.address}
            <br />
            Thời gian dự kiến: {stop.arrival_time}
          </Popup>
        </Marker>
      ))}

 
    </MapContainer>
  );
}
