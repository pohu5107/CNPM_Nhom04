import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// BusRouteParentPause: component riêng cho parent để tránh conflict với driver
// Đồng bộ với trạng thái của driver thông qua busStatus prop, cập nhật real-time
export default function BusRouteParentPause({
  waypoints = [],
  speedMetersPerSec = 18,
  busStatus = null,
  onPositionUpdate = () => {},
}) {
  const map = useMap();
  const markerRef = useRef(null);
  const animRef = useRef(null);
  const routePolylineRef = useRef(null);
  const stateRef = useRef({
    segmentIndex: 0,
    startTime: 0,
    paused: true, // Start paused, wait for driver to start
    segments: [],
    coords: [],
    pauseIndices: [],
    isRunning: false,
  });
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!map || waypoints.length < 2 || initializedRef.current) return;
    initializedRef.current = true;

    const latLngWaypoints = waypoints.map(([lat, lng]) => L.latLng(lat, lng));

    // Show bus marker immediately at start position
    markerRef.current = L.marker(latLngWaypoints[0], {
      icon: L.divIcon({
        html: "<div style='font-size:24px; color: orange;'>🚌</div>",
        iconSize: [24, 24],
        className: "bus-parent-icon",
      }),
    }).addTo(map);

    // Fetch route from OSRM
    const fetchRoute = async () => {
      try {
        const coords = latLngWaypoints.map(wp => `${wp.lng},${wp.lat}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const routeCoords = route.geometry.coordinates.map(c => L.latLng(c[1], c[0]));
          setupAnimation(routeCoords, latLngWaypoints);
        } else {
          // Fallback to direct line
          setupAnimation(latLngWaypoints, latLngWaypoints);
        }
      } catch (error) {
        console.warn('[BusRouteParentPause] OSRM failed, using fallback:', error);
        setupAnimation(latLngWaypoints, latLngWaypoints);
      }
    };

    const setupAnimation = (coords, originalWaypoints) => {
      // Draw route polyline
      if (routePolylineRef.current) routePolylineRef.current.remove();
      routePolylineRef.current = L.polyline(coords, {
        color: "#f97316", // Orange color for parent
        weight: 4,
        opacity: 0.8
      }).addTo(map);
      
      map.fitBounds(routePolylineRef.current.getBounds(), {
        padding: [40, 40],
      });

      // Build movement segments
      const segments = [];
      for (let i = 0; i < coords.length - 1; i++) {
        const from = coords[i];
        const to = coords[i + 1];
        const distance = from.distanceTo(to);
        const duration = (distance / speedMetersPerSec) * 1000;
        segments.push({ from, to, duration });
      }

      // Find pause indices based on original waypoints
      const pauseIndices = [];
      for (let i = 1; i < originalWaypoints.length; i++) {
        const wp = originalWaypoints[i];
        let closestIdx = 0, min = Infinity;
        coords.forEach((c, idx) => {
          const d = wp.distanceTo(c);
          if (d < min) {
            min = d;
            closestIdx = idx;
          }
        });
        pauseIndices.push(closestIdx);
      }

      stateRef.current = {
        segmentIndex: 0,
        startTime: performance.now(),
        paused: true, // Start paused
        segments,
        coords,
        pauseIndices,
        isRunning: false,
      };
    };

    fetchRoute();

    return () => {
      try {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        if (markerRef.current) markerRef.current.remove();
        if (routePolylineRef.current) routePolylineRef.current.remove();
      } catch (e) {
        console.warn('[BusRouteParentPause] Cleanup error:', e);
      }
    };
  }, [map, waypoints]);

  // Sync with driver status - improved reactivity
  useEffect(() => {
    const st = stateRef.current;
    if (!st.segments.length) return;

    console.log('🍊 BusRouteParentPause: Driver status change:', busStatus?.status);

    if (busStatus?.status === 'in_progress') {
      if (!st.isRunning) {
        // Driver just started - begin animation
        console.log('🍊 Parent: Starting animation from driver start');
        st.isRunning = true;
        st.paused = false;
        st.startTime = performance.now();
        
        // Reset to beginning or jump to current stop
        if (busStatus.currentStop !== undefined && busStatus.currentStop > 0) {
          const targetCoordIndex = Math.min(busStatus.currentStop * 30, st.coords.length - 1); // rough estimate
          st.segmentIndex = Math.min(targetCoordIndex, st.segments.length - 1);
          if (st.coords[targetCoordIndex]) {
            markerRef.current?.setLatLng(st.coords[targetCoordIndex]);
          }
        } else {
          st.segmentIndex = 0;
        }
        
        if (!animRef.current) {
          animRef.current = requestAnimationFrame(step);
        }
      } else if (st.paused) {
        // Driver resumed from pause
        console.log('🍊 Parent: Resuming animation from driver resume');
        st.paused = false;
        st.startTime = performance.now();
        if (!animRef.current) {
          animRef.current = requestAnimationFrame(step);
        }
      }
    } 
    else if (busStatus?.status === 'paused' && st.isRunning && !st.paused) {
      // Driver paused - pause animation
      console.log('🍊 Parent: Pausing animation from driver pause');
      st.paused = true;
    } 
    else if (busStatus?.status === 'completed') {
      // Driver completed - stop animation
      console.log('🍊 Parent: Stopping animation from driver completion');
      st.isRunning = false;
      st.paused = true;
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      // Move to final position
      if (st.coords.length > 0) {
        markerRef.current?.setLatLng(st.coords[st.coords.length - 1]);
      }
    }
  }, [busStatus?.status, busStatus?.startTimestamp, busStatus?.resumeTimestamp]);

  const step = (now) => {
    const st = stateRef.current;
    
    if (!st.isRunning || st.paused) {
      // Still schedule next frame to check for state changes
      if (st.isRunning) {
        animRef.current = requestAnimationFrame(step);
      }
      return;
    }
    
    if (st.segmentIndex >= st.segments.length) {
      // Animation completed
      console.log('🍊 Parent: Animation completed');
      st.isRunning = false;
      return;
    }

    const seg = st.segments[st.segmentIndex];
    const elapsed = now - st.startTime;
    
    if (elapsed >= seg.duration) {
      // Move to next segment
      markerRef.current?.setLatLng(seg.to);
      st.segmentIndex += 1;
      st.startTime = now; // Use current time for better accuracy
      
      // Don't auto-pause at waypoints for parent - let driver control
      animRef.current = requestAnimationFrame(step);
      return;
    }

    // Smooth interpolation
    const t = Math.min(elapsed / seg.duration, 1);
    const lat = seg.from.lat + (seg.to.lat - seg.from.lat) * t;
    const lng = seg.from.lng + (seg.to.lng - seg.from.lng) * t;
    
    const currentPos = { lat, lng };
    onPositionUpdate(currentPos);
    markerRef.current?.setLatLng([lat, lng]);
    
    animRef.current = requestAnimationFrame(step);
  };

  return null;
}