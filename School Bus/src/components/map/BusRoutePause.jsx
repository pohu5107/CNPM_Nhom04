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
  onPositionUpdate = () => {}, // Callback để báo cáo vị trí hiện tại
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

    // Show bus marker immediately
    markerRef.current = L.marker(latLngWaypoints[0], {
      icon: L.divIcon({
        html: "<div style='font-size:30px'>🚌</div>",
        iconSize: [24, 24],
        className: "bus-pause-icon",
      }),
    }).addTo(map);

    // Draw baseline polyline immediately so user sees route even before OSRM responds
    baselinePolylineRef.current = L.polyline(latLngWaypoints, {
      color: "#93c5fd",
      weight: 3,
      dashArray: "4,6",
    }).addTo(map);
    map.fitBounds(baselinePolylineRef.current.getBounds(), {
      padding: [40, 40],
    });

    // Set timeout for OSRM routing (8 seconds - longer timeout for better success)
    const routingTimeout = setTimeout(() => {
      console.warn("[BusRoutePause] OSRM timeout, using fallback");
      drawFallback();
    }, 8000);

    // Try direct OSRM API call for better reliability
    const fetchDirectOSRM = async () => {
      try {
        const coords = latLngWaypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        
        console.log('[BusRoutePause] Direct OSRM call:', url);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(c => L.latLng(c[1], c[0]));
          console.log('[BusRoutePause] Got', coords.length, 'route coordinates');
          handleDirectRoute(coords);
          return true;
        }
      } catch (error) {
        console.warn('[BusRoutePause] Direct OSRM failed:', error);
      }
      return false;
    };

    // Start direct OSRM fetch
    fetchDirectOSRM().then(success => {
      clearTimeout(routingTimeout);
      if (!success) {
        console.warn('[BusRoutePause] Using fallback after direct OSRM failed');
        drawFallback();
      }
    });

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
      // Ensure bus marker exists and is at start position
      if (!markerRef.current) {
        console.log("[BusRoutePause] Creating fallback marker");
        markerRef.current = L.marker(latLngWaypoints[0], {
          icon: L.divIcon({
            html: "<div style='font-size:30px'>🚌</div>",
            iconSize: [24, 24],
            className: "bus-pause-icon",
          }),
        }).addTo(map);
      } else {
        markerRef.current.setLatLng(latLngWaypoints[0]);
      }
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

    const handleDirectRoute = (coords) => {
      if (fallbackUsed) return;
      
      console.log("[BusRoutePause] Processing direct route with", coords.length, "coords");
      
      // Replace baseline with actual route polyline
      if (baselinePolylineRef.current) {
        try {
          baselinePolylineRef.current.remove();
        } catch (_) {}
        baselinePolylineRef.current = null;
      }
      
      if (routePolylineRef.current) routePolylineRef.current.remove();
      routePolylineRef.current = L.polyline(coords, {
        color: "#2563eb",
        weight: 5,
        opacity: 0.9
      }).addTo(map);
      
      map.fitBounds(routePolylineRef.current.getBounds(), {
        padding: [40, 40],
      });

      // Ensure bus marker exists and update position
      if (!markerRef.current) {
        markerRef.current = L.marker(coords[0], {
          icon: L.divIcon({
            html: "<div style='font-size:30px'>🚌</div>",
            iconSize: [24, 24],
            className: "bus-pause-icon",
          }),
        }).addTo(map);
      } else {
        markerRef.current.setLatLng(coords[0]);
      }

      // Build movement segments
      const segments = [];
      for (let i = 0; i < coords.length - 1; i++) {
        const from = coords[i];
        const to = coords[i + 1];
        const distance = from.distanceTo(to);
        const duration = (distance / speedMetersPerSec) * 1000;
        segments.push({ from, to, duration });
      }

      // Determine coordinate indices closest to original waypoints for pauses
      const pauseIndices = [];
      for (let i = 1; i < latLngWaypoints.length; i++) {
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
      
      // Báo cáo vị trí hiện tại cho parent component
      onPositionUpdate({ lat, lng });
      
      // Defensive check to prevent null reference error
      if (markerRef.current && markerRef.current.setLatLng) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        console.warn("[BusRoutePause] Marker lost, recreating...");
        if (map) {
          markerRef.current = L.marker([lat, lng], {
            icon: L.divIcon({
              html: "<div style='font-size:30px'>🚌</div>",
              iconSize: [24, 24],
              className: "bus-pause-icon",
            }),
          }).addTo(map);
        }
      }
      
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
