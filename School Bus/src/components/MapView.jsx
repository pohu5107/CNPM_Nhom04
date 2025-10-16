import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// FIX lỗi icon mặc định không hiện (Vite/CRA hay gặp)
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView({
  center = [10.776, 106.700], // HCM
  zoom = 13,
  height = "60vh",
}) {
  return (
    <div style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>Vị trí trung tâm</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
