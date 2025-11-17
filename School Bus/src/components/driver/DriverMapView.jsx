import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// FIX lỗi icon mặc định không hiện
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Icon cho các điểm dừng (nhỏ gọn)
const stopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// Recenter helper: khi parent truyền latlng, component sẽ flyTo
function Recenter({ latlng }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !latlng) return;
    // normalize latlng array or object
    let lat, lng;
    if (Array.isArray(latlng)) {
      lat = parseFloat(latlng[0]);
      lng = parseFloat(latlng[1]);
    } else if (latlng && typeof latlng === 'object') {
      lat = parseFloat(latlng.lat ?? latlng.latitude ?? NaN);
      lng = parseFloat(latlng.lng ?? latlng.longitude ?? NaN);
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const doFly = () => { try { map.flyTo([lat, lng], 15); } catch (e) { console.warn('flyTo failed', e); } };
    if (map && map._loaded) {
      doFly();
    } else if (map && typeof map.whenReady === 'function') {
      map.whenReady(doFly);
    }
  }, [map, latlng]);
  return null;
}

// PRESENTATIONAL component: hoàn toàn dựa vào props của parent
export default function DriverMapView({ stops = [], routeLine = [], mapCenter = [10.776, 106.700], focusedStopIndex = null }) {
  const hasGeometry = Array.isArray(routeLine) && routeLine.length > 0;
  const hasStops = Array.isArray(stops) && stops.length > 0;

  const defaultCenter = [10.776, 106.700];
  const centerProp = (Array.isArray(mapCenter) && mapCenter.length === 2 && Number.isFinite(parseFloat(mapCenter[0])) && Number.isFinite(parseFloat(mapCenter[1])))
    ? mapCenter
    : defaultCenter;

  return (
    <MapContainer center={centerProp} zoom={14} style={{ height: '100%', width: '100%' }}>
      {/* Nếu parent truyền focusedStopIndex, Recenter sẽ fly map */}
      {focusedStopIndex != null && hasStops && stops[focusedStopIndex] && (
        <Recenter latlng={[stops[focusedStopIndex].latitude, stops[focusedStopIndex].longitude]} />
      )}

      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Vẽ đường đi của tuyến (nếu có) */}
      {hasGeometry && (
        <Polyline positions={routeLine} color="blue" weight={5} />
      )}

      {/* Đánh dấu các điểm dừng do parent cung cấp */}
      {hasStops && stops.map((stop, index) => {
        // Validate coordinates before creating Marker to avoid Leaflet errors
        const lat = stop.latitude != null ? parseFloat(stop.latitude) : NaN;
        const lng = stop.longitude != null ? parseFloat(stop.longitude) : NaN;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return (
            <Marker
              key={stop.id || index}
              position={[lat, lng]}
              icon={stopIcon}
            >
              <Popup>
                <b>Điểm dừng {index + 1}: {stop.name}</b>
                <br />
                {stop.address && <>Địa chỉ: {stop.address}<br /></>}
                {stop.arrival_time && <>Thời gian dự kiến: {stop.arrival_time}</>}
              </Popup>
            </Marker>
          );
        }
        // skip invalid coords
        console.warn('Skipping stop without valid coords', stop);
        return null;
      })}
      

      {/* Thông báo nếu không có dữ liệu */}
      {(!hasGeometry && !hasStops) && (
        <div
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}
          className="bg-white/90 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 shadow"
        >
          Không có dữ liệu lộ trình.
        </div>
      )}
    </MapContainer>
  );
}
