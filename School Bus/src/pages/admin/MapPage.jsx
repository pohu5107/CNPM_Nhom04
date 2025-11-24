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

  // Demo tuyến đường quanh trường với 2 điểm dừng (không phải đường chim bay)
  // Waypoints: Campus -> Stop 1 -> Stop 2
  const routeWaypoints = [
    campus,
    [10.76055, 106.6834], // Điểm dừng 1 (gần vòng quanh An Dương Vương / Nguyễn Văn Cừ)
    [10.7579, 106.6831], // Điểm dừng 2 (phía Đông Bắc trường, gần Trần Phú)
    campus, // Quay lại điểm bắt đầu
  ];

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
          center={center}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marker Campus */}
          <Marker position={campus}>
            <Popup>
              <strong>Đại học Sài Gòn</strong>
              <br /> 273 An Dương Vương, Quận 5
            </Popup>
          </Marker>

          {/* Hai điểm dừng demo */}
          {routeWaypoints.slice(1).map((p, i) => (
            <Marker key={i} position={p}>
              <Popup>
                <strong>Điểm dừng {i + 1}</strong>
                <br />
                Lat: {p[0].toFixed(5)}
                <br />
                Lng: {p[1].toFixed(5)}
              </Popup>
            </Marker>
          ))}

          {/* Xe buýt chạy theo đường thực giữa các waypoint */}
          <BusRouteAnimationV2
            waypoints={routeWaypoints}
            stopDurationMs={2500}
            speedMetersPerSec={18}
            loop={true}
          />
        </MapContainer>
      </div>
    </div>
  );
}
