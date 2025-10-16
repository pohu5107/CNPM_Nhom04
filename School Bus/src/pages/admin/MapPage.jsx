// src/pages/admin/MapPage.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapPage() {
  const center = [10.776, 106.700]; // HCM

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
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={center}>
            <Popup>Vị trí trung tâm — TP.HCM</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
