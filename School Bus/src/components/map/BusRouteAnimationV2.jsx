import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

// BusRouteAnimationV2: Animate a bus icon along real road route between waypoints.
// Props:
// - waypoints: array of [lat,lng]
// - speedMetersPerSec: movement speed
// - stopDurationMs: pause time at intermediate waypoints

export default function BusRouteAnimationV2({
  waypoints = [],
  speedMetersPerSec = 18,
  stopDurationMs = 2500,
  loop = false,
}) {
  const map = useMap();
  const markerRef = useRef(null);
  const animRef = useRef(null);
  const routingControlRef = useRef(null);
  const stateRef = useRef({ segmentIndex: 0, pausedUntil: 0 });
  const routeReadyRef = useRef(false); // ensure we process route only once

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    // Build Leaflet LatLng waypoints
    // Snapshot values so effect not re-run by stable parent
    const latLngWaypoints = waypoints.map(([lat, lng]) => L.latLng(lat, lng));

    // Create routing control to compute actual road path
    routingControlRef.current = L.Routing.control({
      waypoints: latLngWaypoints,
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      show: false,
      fitSelectedRoutes: false,
      lineOptions: { styles: [{ color: "red", weight: 5, opacity: 0.85 }] },
      createMarker: () => null,
    }).addTo(map);

    // Bus icon
    const busIcon = L.divIcon({
      html: "<div style='font-size:30px'>🚌</div>",
      iconSize: [24, 24],
      className: "bus-anim-icon",
    });

    const handleRoutesFound = (e) => {
      if (routeReadyRef.current) return; // skip if already initialized
      routeReadyRef.current = true;
      const route = e.routes[0];
      const coords = route.coordinates.map((c) => L.latLng(c.lat, c.lng));
      map.fitBounds(L.polyline(coords).getBounds(), { padding: [40, 40] });

      // Place marker at start
      markerRef.current = L.marker(coords[0], { icon: busIcon }).addTo(map);

      // Build segments
      const segments = [];
      for (let i = 0; i < coords.length - 1; i++) {
        const from = coords[i];
        const to = coords[i + 1];
        const distance = from.distanceTo(to);
        const duration = (distance / speedMetersPerSec) * 1000; // ms
        segments.push({ from, to, duration });
      }

      // Map original intermediate waypoints to closest segment index for pauses
      const pauseIndices = [];
      for (let i = 1; i < latLngWaypoints.length - 1; i++) {
        const wp = latLngWaypoints[i];
        let closestIdx = 0;
        let min = Infinity;
        coords.forEach((c, idx) => {
          const d = wp.distanceTo(c);
          if (d < min) {
            min = d;
            closestIdx = idx;
          }
        });
        pauseIndices.push(closestIdx);
      }

      stateRef.current = { segmentIndex: 0, pausedUntil: 0 };
      const startTimeRef = { value: performance.now() };

      const step = (now) => {
        const st = stateRef.current;

        if (st.pausedUntil && now < st.pausedUntil) {
          animRef.current = requestAnimationFrame(step);
          return;
        }

        if (st.segmentIndex >= segments.length) {
          // Hoàn tất một vòng
          if (loop) {
            // Reset về đầu
            st.segmentIndex = 0;
            st.pausedUntil = 0;
            markerRef.current.setLatLng(segments[0].from);
            startTimeRef.value = performance.now();
            animRef.current = requestAnimationFrame(step);
          }
          return; // finished (or restarted if loop)
        }

        const seg = segments[st.segmentIndex];
        const elapsed = now - startTimeRef.value;

        if (elapsed >= seg.duration) {
          // Snap to end
          markerRef.current.setLatLng(seg.to);
          st.segmentIndex += 1;
          const justIdx = st.segmentIndex; // segment index also acts as coordinate index
          if (pauseIndices.includes(justIdx)) {
            st.pausedUntil = now + stopDurationMs;
          } else {
            st.pausedUntil = 0;
          }
          startTimeRef.value = performance.now();
          animRef.current = requestAnimationFrame(step);
          return;
        }

        const t = elapsed / seg.duration;
        const lat = seg.from.lat + (seg.to.lat - seg.from.lat) * t;
        const lng = seg.from.lng + (seg.to.lng - seg.from.lng) * t;
        markerRef.current.setLatLng([lat, lng]);
        animRef.current = requestAnimationFrame(step);
      };

      animRef.current = requestAnimationFrame(step);
    };

    routingControlRef.current.on("routesfound", handleRoutesFound);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (markerRef.current) markerRef.current.remove();
      if (routingControlRef.current) {
        routingControlRef.current.off("routesfound", handleRoutesFound);
        map.removeControl(routingControlRef.current);
      }
      routeReadyRef.current = false;
    };
  // Depend ONLY on map; other values captured in closure to avoid re-init flicker
  // If you need dynamic speed in future, add proper update logic.
  }, [map]);

  return null;
}
