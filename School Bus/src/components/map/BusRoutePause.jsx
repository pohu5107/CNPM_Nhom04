import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// BusRoutePause: animate along actual road route, pause at each intermediate waypoint.
// Props:
// waypoints: array of [lat,lng]
// speedMetersPerSec: movement speed
// onReachStop(idx, resumeFn): called when bus reaches waypoint index (1..n-1) before final.
// loop: whether to restart after finishing.
export default function BusRoutePause({
  waypoints = [],
  speedMetersPerSec = 18,
  onReachStop = () => {},
  loop = false,
}) {
  const map = useMap();
  const markerRef = useRef(null);
  const animRef = useRef(null);
  const routingControlRef = useRef(null);
  const baselinePolylineRef = useRef(null); // always show something
  const routePolylineRef = useRef(null); // actual routed path
  const stateRef = useRef({
    segmentIndex: 0,
    startTime: 0,
    paused: false,
    segments: [],
    coords: [],
    pauseIndices: [],
  });
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!map || waypoints.length < 2 || initializedRef.current) return;
    initializedRef.current = true;

    const latLngWaypoints = waypoints.map(([lat, lng]) => L.latLng(lat, lng));

    // Draw baseline polyline immediately so user sees route even before OSRM responds
    baselinePolylineRef.current = L.polyline(latLngWaypoints, {
      color: "#93c5fd",
      weight: 3,
      dashArray: "4,6",
    }).addTo(map);
    map.fitBounds(baselinePolylineRef.current.getBounds(), {
      padding: [40, 40],
    });

    routingControlRef.current = L.Routing.control({
      waypoints: latLngWaypoints,
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      fitSelectedRoutes: false,
      lineOptions: { styles: [{ color: "#2563eb", weight: 5, opacity: 0.9 }] },
      createMarker: () => null,
      routeWhileDragging: false,
      autoRoute: true,
    }).addTo(map);

    let fallbackUsed = false;

    const drawFallback = () => {
      if (fallbackUsed) return;
      fallbackUsed = true;
      console.warn("[BusRoutePause] Using fallback polyline (routing failed)");
      const poly = L.polyline(latLngWaypoints, {
        color: "#2563eb",
        weight: 4,
        dashArray: "6,4",
      }).addTo(map);
      map.fitBounds(poly.getBounds(), { padding: [40, 40] });
      // Build simple segments from consecutive waypoints directly
      const simpleSegments = [];
      for (let i = 0; i < latLngWaypoints.length - 1; i++) {
        const from = latLngWaypoints[i];
        const to = latLngWaypoints[i + 1];
        const distance = from.distanceTo(to);
        const duration = (distance / speedMetersPerSec) * 1000;
        simpleSegments.push({ from, to, duration });
      }
      markerRef.current = L.marker(latLngWaypoints[0], {
        icon: L.divIcon({
          html: "<div style='font-size:30px'>🚌</div>",
          iconSize: [24, 24],
          className: "bus-pause-icon",
        }),
      }).addTo(map);
      // Pause at each intermediate waypoint (excluding start)
      const pauseIndices = []; // coordinate index approach reused: just use waypoint indices directly
      for (let i = 1; i < latLngWaypoints.length; i++) pauseIndices.push(i);
      stateRef.current = {
        segmentIndex: 0,
        startTime: performance.now(),
        paused: false,
        segments: simpleSegments,
        coords: latLngWaypoints,
        pauseIndices,
      };
      animRef.current = requestAnimationFrame(step);
    };

    const handleRoutesFound = (e) => {
      console.log("[BusRoutePause] routesfound waypoints:", waypoints);
      const route = e.routes[0];
      const coords = route.coordinates.map((c) => L.latLng(c.lat, c.lng));
      console.log("[BusRoutePause] total coords:", coords.length);
      // Replace baseline with actual route polyline
      if (routePolylineRef.current) routePolylineRef.current.remove();
      routePolylineRef.current = L.polyline(coords, {
        color: "#2563eb",
        weight: 5,
      }).addTo(map);
      map.fitBounds(routePolylineRef.current.getBounds(), {
        padding: [40, 40],
      });
      if (baselinePolylineRef.current) {
        try {
          baselinePolylineRef.current.remove();
        } catch (_) {}
        baselinePolylineRef.current = null;
      }

      markerRef.current = L.marker(coords[0], {
        icon: L.divIcon({
          html: "<div style='font-size:30px'>🚌</div>",
          iconSize: [24, 24],
          className: "bus-pause-icon",
        }),
      }).addTo(map);

      // Build movement segments
      const segments = [];
      for (let i = 0; i < coords.length - 1; i++) {
        const from = coords[i];
        const to = coords[i + 1];
        const distance = from.distanceTo(to);
        const duration = (distance / speedMetersPerSec) * 1000;
        segments.push({ from, to, duration });
      }

      // Determine coordinate indices closest to original waypoints (excluding first) for pauses
      const pauseIndices = [];
      for (let i = 1; i < latLngWaypoints.length; i++) {
        // pause at each intermediate including final arrival
        const wp = latLngWaypoints[i];
        let closestIdx = 0,
          min = Infinity;
        coords.forEach((c, idx) => {
          const d = wp.distanceTo(c);
          if (d < min) {
            min = d;
            closestIdx = idx;
          }
        });
        pauseIndices.push(closestIdx);
      }
      console.log("[BusRoutePause] pauseIndices:", pauseIndices);

      stateRef.current = {
        segmentIndex: 0,
        startTime: performance.now(),
        paused: false,
        segments,
        coords,
        pauseIndices,
      };
      animRef.current = requestAnimationFrame(step);
    };

    routingControlRef.current.on("routesfound", handleRoutesFound);
    routingControlRef.current.on("routingerror", (err) => {
      console.error("[BusRoutePause] routingerror:", err);
      drawFallback();
    });

    const step = (now) => {
      const st = stateRef.current;
      if (st.paused) {
        animRef.current = requestAnimationFrame(step);
        return;
      }
      if (st.segmentIndex >= st.segments.length) {
        if (loop) {
          st.segmentIndex = 0;
          st.startTime = performance.now();
          st.paused = false;
          markerRef.current.setLatLng(st.segments[0].from);
          animRef.current = requestAnimationFrame(step);
        }
        return;
      }
      const seg = st.segments[st.segmentIndex];
      const elapsed = now - st.startTime;
      if (elapsed >= seg.duration) {
        markerRef.current.setLatLng(seg.to);
        st.segmentIndex += 1;
        st.startTime = performance.now();
        // If this segment end coordinate index is in pauseIndices trigger pause
        const coordIdx = st.segmentIndex; // corresponds to coords index
        if (st.pauseIndices.includes(coordIdx)) {
          st.paused = true;
          const waypointIdx = st.pauseIndices.indexOf(coordIdx) + 1; // original waypoint index (1..)
          console.log("[BusRoutePause] Paused at waypointIdx:", waypointIdx);
          onReachStop(waypointIdx, () => {
            st.paused = false;
            st.startTime = performance.now();
          });
        }
        animRef.current = requestAnimationFrame(step);
        return;
      }
      const t = elapsed / seg.duration;
      const lat = seg.from.lat + (seg.to.lat - seg.from.lat) * t;
      const lng = seg.from.lng + (seg.to.lng - seg.from.lng) * t;
      markerRef.current.setLatLng([lat, lng]);
      animRef.current = requestAnimationFrame(step);
    };

    return () => {
      // Defensive cleanup (can run multiple times during fast remounts)
      try {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        animRef.current = null;
        if (markerRef.current) {
          try {
            markerRef.current.remove();
          } catch (_) {}
          markerRef.current = null;
        }
        if (routePolylineRef.current) {
          try {
            routePolylineRef.current.remove();
          } catch (_) {}
          routePolylineRef.current = null;
        }
        if (baselinePolylineRef.current) {
          try {
            baselinePolylineRef.current.remove();
          } catch (_) {}
          baselinePolylineRef.current = null;
        }
        if (routingControlRef.current) {
          try {
            routingControlRef.current.off("routesfound", handleRoutesFound);
          } catch (_) {}
          try {
            routingControlRef.current.off("routingerror", drawFallback);
          } catch (_) {}
          if (routingControlRef.current._map) {
            try {
              routingControlRef.current.remove();
            } catch (remErr) {
              console.warn("[BusRoutePause] control remove warn:", remErr);
            }
          }
          routingControlRef.current = null;
        }
      } catch (cleanupErr) {
        console.warn("[BusRoutePause] cleanup error (ignored):", cleanupErr);
      }
    };
  }, [map]); // run only once after map ready

  return null;
}
