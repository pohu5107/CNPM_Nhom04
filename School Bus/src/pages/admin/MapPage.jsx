// src/pages/admin/MapPage.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"; // CSS cho đường đi thực tế
import BusRouteAnimationV2 from "../../components/map/BusRouteAnimationV2.jsx";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;


export default function MapPage() {
  // Tọa độ Đại học Sài Gòn (273 An Dương Vương, Quận 5, TP.HCM) gần chính xác
  const campus = [10.75875, 106.68095];
  const center = campus;


  const stops = [
    { id: 1, name: "Nhà Văn hóa Thanh Niên", lat: 10.75875, lng: 106.68095 },
    { id: 2, name: "Nguyễn Văn Cừ", lat: 10.76055, lng: 106.6834 },
    { id: 3, name: "Nguyễn Biểu", lat: 10.7579, lng: 106.6831 },
    { id: 4, name: "Trường THCS Nguyễn Du", lat: 10.7545, lng: 106.6815 },
  ];


  const routeWaypoints = [campus, ...stops.map((s) => [s.lat, s.lng]), campus];

  return (
    <div
      className="flex flex-col w-full h-[88vh] bg-white p-4"
      style={{
        margin: 0,
        padding: 0,
      }}
    >
      <h1 className="text-3xl font-bold mb-3 text-[#174D2C] pl-4">Bản đồ</h1>

      <div
        className="flex-1 rounded-xl overflow-hidden shadow-md border border-gray-300"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <MapContainer
          center={routeWaypoints.length ? routeWaypoints[0] : center}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

        
          <Marker position={stops && stops.length ? [stops[0].lat, stops[0].lng] : campus}>
            <Popup>
              <strong>{stops && stops.length ? stops[0].name : "Đại học Sài Gòn"}</strong>
              <br /> {stops && stops.length ? "" : "273 An Dương Vương, Quận 5"}
            </Popup>
          </Marker>


          {stops.map((s) => (
            <Marker key={s.id} position={[s.lat, s.lng]}>
              <Popup>
                <strong>{s.name}</strong>
                <br /> Lat: {s.lat.toFixed(5)}
                <br /> Lng: {s.lng.toFixed(5)}
              </Popup>
            </Marker>
          ))}


          <BusRouteAnimationV2
            waypoints={routeWaypoints}
            stopDurationMs={2500}
            // Dùng tốc độ tương tự ở trang driver để giao diện đồng nhất
            speedMetersPerSec={50}
            loop={false}
          />
        </MapContainer>
      </div>
    </div>
  );
}
