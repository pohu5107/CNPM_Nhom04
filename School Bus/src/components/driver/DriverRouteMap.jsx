import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import BusRouteControlled from "../map/BusRouteControlled.jsx";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Default icon setup (isolated here so we don't repeat in parent)
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function DriverRouteMap({ isRunning, stops = [], onStopArrive, busRef }) {
  const campus = useMemo(() => [10.75875, 106.68095], []);
  const routeWaypoints = useMemo(() => {
    if (stops.length > 0) {
      return stops.map((s) => ({ lat: s.lat, lng: s.lng }));
    }
    return [
      { lat: campus[0], lng: campus[1] },
      { lat: 10.76055, lng: 106.6834 },
      { lat: 10.7579, lng: 106.6831 },
    ];
  }, [stops, campus]);

  return (
    <MapContainer
      center={campus}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={campus}>
        <Popup>
          <strong>Đại học Sài Gòn</strong>
          <br /> 273 An Dương Vương, Quận 5
        </Popup>
      </Marker>

      {routeWaypoints.slice(1).map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]}>
          <Popup>
            <strong>Điểm dừng {i + 1}</strong>
            <br />
            Lat: {p.lat.toFixed(5)}
            <br />
            Lng: {p.lng.toFixed(5)}
          </Popup>
        </Marker>
      ))}

      {isRunning && (
        <BusRouteControlled
          ref={busRef}
          waypoints={routeWaypoints}
          speedMetersPerSec={18}
          loop={false}
          onReachStop={(idx, resumeWrapper) => {
            if (onStopArrive) onStopArrive(idx, resumeWrapper);
          }}
        />
      )}
    </MapContainer>
  );
}

export default React.memo(DriverRouteMap);
