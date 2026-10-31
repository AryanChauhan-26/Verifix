import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({ 
  providerLat = 12.9784, 
  providerLng = 77.6408, 
  customerLat = 12.9716, 
  customerLng = 77.6412,
  providerName = 'Provider',
  etaMinutes = 6,
  distanceKm = 1.2,
  height = '200px',
  isLiveTracking = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const providerMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false
      });

      mapInstanceRef.current = map;

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Customer Icon (Home Pin)
      const customerIcon = L.divIcon({
        className: 'custom-customer-icon',
        html: `
          <div style="background-color: #047857; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid white;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Provider Vehicle Icon (Bike with pulse halo)
      const providerIcon = L.divIcon({
        className: 'custom-provider-icon',
        html: `
          <div style="background-color: #0f172a; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.4); border: 2.5px solid #10b981; position: relative;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span style="position: absolute; top: -4px; right: -4px; background-color: #ef4444; width: 11px; height: 11px; border-radius: 50%; border: 2px solid white;"></span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      L.marker([customerLat, customerLng], { icon: customerIcon })
        .addTo(map)
        .bindPopup('<b>Customer Location</b><br/>Indiranagar Doorstep');

      const pMarker = L.marker([providerLat, providerLng], { icon: providerIcon })
        .addTo(map)
        .bindPopup(`<b>${providerName}</b><br/>En Route (ETA: ${etaMinutes} mins)`);

      providerMarkerRef.current = pMarker;

      // Draw dashed trajectory route
      const latlngs = [
        [providerLat, providerLng],
        [(providerLat + customerLat) / 2 + 0.0008, (providerLng + customerLng) / 2 - 0.0008],
        [customerLat, customerLng]
      ];
      
      const polyline = L.polyline(latlngs, {
        color: '#059669',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.9
      }).addTo(map);

      routeLineRef.current = polyline;

      // Fit map bounds
      const bounds = L.latLngBounds([
        [providerLat, providerLng],
        [customerLat, customerLng]
      ]);
      map.fitBounds(bounds, { padding: [40, 40] });

    } catch (e) {
      console.warn('Map initialization error:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run on initial mount

  // React to live GPS coordinate updates dynamically
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (providerMarkerRef.current) {
      providerMarkerRef.current.setLatLng([providerLat, providerLng]);
      providerMarkerRef.current.setPopupContent(
        `<b>${providerName}</b><br/>Live GPS • ${distanceKm} km away (ETA: ${etaMinutes} mins)`
      );
    }

    if (routeLineRef.current) {
      const latlngs = [
        [providerLat, providerLng],
        [(providerLat + customerLat) / 2 + 0.0008, (providerLng + customerLng) / 2 - 0.0008],
        [customerLat, customerLng]
      ];
      routeLineRef.current.setLatLngs(latlngs);
    }
  }, [providerLat, providerLng, customerLat, customerLng, etaMinutes, distanceKm, providerName]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0 bg-slate-100" />
      
      {/* Top Left Live Status Pill */}
      <div className="absolute top-2.5 left-2.5 z-10 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-2 shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Live GPS • {distanceKm} km away</span>
      </div>

      {/* Top Right Live ETA Pill */}
      <div className="absolute top-2.5 right-2.5 z-10 bg-emerald-700/95 text-white backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1 shadow-md">
        <span>ETA ~{etaMinutes} mins</span>
      </div>
    </div>
  );
}
