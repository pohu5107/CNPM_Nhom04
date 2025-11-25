import React, { useEffect, useRef, useImperativeHandle } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

// Controlled bus route animation: pauses at each waypoint until resume() called.
// Props:
// waypoints: [{lat,lng}] in travel order
// speedMetersPerSec: movement speed
// onReachStop: (index, resumeFn) => void (index corresponds to waypoint index)
// loop: whether to loop route (default false)
const BusRouteControlled = React.forwardRef(function BusRouteControlled(
  {
    waypoints = [],
    speedMetersPerSec = 18,
    onReachStop = () => {},
    loop = false,
  },
  ref
) {
  const map = useMap();
  const markerRef = useRef(null);
  const animRef = useRef(null);
  const routingControlRef = useRef(null);
  const stateRef = useRef({
    segmentIndex: 0,
    paused: false,
    startTime: 0,
    segments: [],
    coords: [],
  });
  const initializedRef = useRef(false);
  const pendingResumeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    resume: () => {
      if (stateRef.current.paused) {
        stateRef.current.paused = false;
        stateRef.current.startTime = performance.now();
        animRef.current = requestAnimationFrame(step);
      }
    },
  }));

  useEffect(() => {
    if (!map || waypoints.length < 2 || initializedRef.current) return;
    initializedRef.current = true;

    const latLngWaypoints = waypoints.map((w) => L.latLng(w.lat, w.lng));

    routingControlRef.current = L.Routing.control({
      waypoints: latLngWaypoints,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      fitSelectedRoutes: false,
      lineOptions: { styles: [{ color: "#FF5722", weight: 5, opacity: 0.9 }] },
      createMarker: () => null,
    }).addTo(map);

    const handleRoutesFound = (e) => {
      const route = e.routes[0];
      const coords = route.coordinates.map((c) => L.latLng(c.lat, c.lng));
      map.fitBounds(L.polyline(coords).getBounds(), { padding: [40, 40] });
      markerRef.current = L.marker(coords[0], {
        icon: L.divIcon({
          html: "<div style='font-size:30px'>🚌</div>",
          iconSize: [24, 24],
          className: "bus-controlled-icon",
        }),
      }).addTo(map);

      // Build segments
      const segments = [];
      for (let i = 0; i < coords.length - 1; i++) {
        const from = coords[i];
        const to = coords[i + 1];
        const distance = from.distanceTo(to);
        const duration = (distance / speedMetersPerSec) * 1000;
        segments.push({ from, to, duration });
      }

      stateRef.current = {
        segmentIndex: 0,
        paused: false,
        startTime: performance.now(),
        segments,
        coords,
      };
      animRef.current = requestAnimationFrame(step);
    };

    routingControlRef.current.on("routesfound", handleRoutesFound);

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
        // Check if reached a waypoint (approximate by closest coordinate to original waypoints)
        // We pause at every waypoint except the first start (index 0).
        // Find index in original latLngWaypoints by nearest match
        // Optimize: build a map once
        const wpIdx = findWaypointIndex(seg.to, waypoints);
        if (wpIdx > 0 && wpIdx < waypoints.length) {
          st.paused = true;
          onReachStop(wpIdx, () => {
            pendingResumeRef.current = true;
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

    function findWaypointIndex(latLng, wps) {
      let min = Infinity;
      let idx = -1;
      wps.forEach((w, i) => {
        const d = L.latLng(w.lat, w.lng).distanceTo(latLng);
        if (d < min) {
          min = d;
          idx = i;
        }
      });
      return idx;
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (markerRef.current) markerRef.current.remove();
      if (routingControlRef.current) {
        routingControlRef.current.off("routesfound", handleRoutesFound);
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, waypoints, speedMetersPerSec, loop, onReachStop]);

  // Effect to execute pending resume from callback wrapper
  useEffect(() => {
    if (pendingResumeRef.current) {
      pendingResumeRef.current = null;
      if (stateRef.current.paused) {
        stateRef.current.paused = false;
        stateRef.current.startTime = performance.now();
      }
    }
  });

  return null;
});

export default BusRouteControlled;
