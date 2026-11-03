import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle, 
  Polyline, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useApp } from '../context/AppContext';
import { reverseGeocode } from '../services/geocodingService';
import { fetchDrivingRoute } from '../services/routingService';
import { 
  calculateDistanceKm, 
  hasMovedSignificantly, 
  roundForPrivacy, 
  calculateEtaMinutes 
} from '../utils/geoHelpers';
import { 
  createUserLocationIcon, 
  createProviderMarkerIcon, 
  createActiveAssignedProviderIcon, 
  createClusterCustomIcon 
} from '../utils/leafletIcons';
import { 
  Crosshair, 
  Clock, 
  Navigation, 
  Star, 
  Repeat, 
  CheckCircle2, 
  ArrowRight,
  X 
} from 'lucide-react';

// Default Fallback Coordinates (Indiranagar, Bengaluru)
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.6412 };

// Map Camera Controller: Smooth, non-jittery camera handling
function MapCameraController({ 
  userCoords, 
  routeCoords, 
  recenterTrigger, 
  hasActiveJob 
}) {
  const map = useMap();
  const initialCenteredRef = useRef(false);

  // 1. Initial center on user location once map loads
  useEffect(() => {
    if (!initialCenteredRef.current && userCoords) {
      map.setView([userCoords.lat, userCoords.lng], 14, { animate: false });
      initialCenteredRef.current = true;
    }
  }, [userCoords, map]);

  // 2. Fly to user location when user explicitly taps "Locate me"
  useEffect(() => {
    if (recenterTrigger > 0 && userCoords) {
      map.flyTo([userCoords.lat, userCoords.lng], 15, { duration: 1.2 });
    }
  }, [recenterTrigger, userCoords, map]);

  // 3. Auto-fit route bounds when active job route updates
  useEffect(() => {
    if (hasActiveJob && routeCoords && routeCoords.length > 1) {
      try {
        const bounds = L.latLngBounds(routeCoords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      } catch (e) {
        // Ignore invalid bounds
      }
    }
  }, [hasActiveJob, routeCoords, map]);

  return null;
}

export default function LiveCustomerMap({ 
  onSelectProvider, 
  activeCategoryFilter = 'all',
  selectedWorker = null,
  onClearSelectedWorker
}) {
  const { 
    providers, 
    activeJob, 
    providerLocation, 
    setSelectedLocality, 
    showToast 
  } = useApp();

  // 1. User Location State & Permission State
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
  const [locationAccuracy, setLocationAccuracy] = useState(35);
  const [hasLocationPermission, setHasLocationPermission] = useState(() => {
    return sessionStorage.getItem('verifix_loc_permission') || null;
  });
  const [showPermissionDialog, setShowPermissionDialog] = useState(() => {
    return !sessionStorage.getItem('verifix_loc_permission');
  });
  const [isLocating, setIsLocating] = useState(false);
  const [recenterCount, setRecenterCount] = useState(0);

  // 2. Active Job Route Geometry
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const prevCoordsRef = useRef(null);
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);

  // Reverse geocoding on location change
  const updateAddress = useCallback(async (lat, lng) => {
    const result = await reverseGeocode(lat, lng);
    if (result && result.suburb) {
      setSelectedLocality(result.suburb);
    }
  }, [setSelectedLocality]);

  // Geolocation watchPosition tracker
  const startWatchingPosition = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported by your browser. Using area fallback.', 'warning');
      setHasLocationPermission('denied');
      sessionStorage.setItem('verifix_loc_permission', 'denied');
      return;
    }

    setIsLocating(true);

    // Initial position lookup
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setHasLocationPermission('granted');
        sessionStorage.setItem('verifix_loc_permission', 'granted');
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocationAccuracy(pos.coords.accuracy || 30);
        prevCoordsRef.current = coords;
        setRecenterCount((c) => c + 1);
        updateAddress(coords.lat, coords.lng);
        showToast('Live GPS connected', 'success');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        setHasLocationPermission('denied');
        sessionStorage.setItem('verifix_loc_permission', 'denied');
        showToast('Location permission not granted. Showing nearby area.', 'info');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );

    // Continuous watchPosition with >20m movement throttling
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocationAccuracy(pos.coords.accuracy || 30);

        if (hasMovedSignificantly(prevCoordsRef.current, newCoords, 20)) {
          prevCoordsRef.current = newCoords;
          setUserLocation(newCoords);
          updateAddress(newCoords.lat, newCoords.lng);
        }
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }, [showToast, updateAddress]);

  // Clean up watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Recenter map on user location
  const handleLocateMe = () => {
    if (hasLocationPermission !== 'granted') {
      startWatchingPosition();
    } else {
      setRecenterCount((c) => c + 1);
      showToast('Centered on your doorstep GPS', 'info');
    }
  };

  // Active Job Driving Route Tracking (OSRM)
  useEffect(() => {
    let isMounted = true;
    if (
      activeJob && 
      activeJob.status !== 'requested' && 
      activeJob.status !== 'no_providers_available' &&
      activeJob.status !== 'completed' &&
      activeJob.provider
    ) {
      const proLat = providerLocation?.lat || activeJob.provider.lat;
      const proLng = providerLocation?.lng || activeJob.provider.lng;
      const custLat = userLocation.lat;
      const custLng = userLocation.lng;

      fetchDrivingRoute(proLat, proLng, custLat, custLng).then((res) => {
        if (isMounted && res) {
          setRouteCoordinates(res.coordinates);
          setRouteInfo(res);
        }
      });
    } else {
      setRouteCoordinates([]);
      setRouteInfo(null);
    }

    return () => { isMounted = false; };
  }, [activeJob, providerLocation, userLocation]);

  // Visible providers filtered by online status, category, and radius
  const visibleProviders = useMemo(() => {
    // Hide other workers if a job is in progress
    if (activeJob && activeJob.status !== 'requested' && activeJob.status !== 'no_providers_available') {
      return [];
    }

    return providers
      .filter((pro) => {
        if (!pro.isOnline || !pro.isVerified) return false;

        // 2-Minute offline cutoff
        if (pro.lastSeenAt) {
          const lastSeenTime = new Date(pro.lastSeenAt).getTime();
          const twoMinAgo = Date.now() - 2 * 60 * 1000;
          if (lastSeenTime < twoMinAgo) return false;
        }

        // Category Filter
        if (activeCategoryFilter && activeCategoryFilter !== 'all' && pro.category !== activeCategoryFilter) {
          return false;
        }

        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, pro.lat, pro.lng);
        return dist <= 8.0; // Default 8 km coverage
      })
      .map((pro) => {
        const approxLat = roundForPrivacy(pro.lat, 3);
        const approxLng = roundForPrivacy(pro.lng, 3);
        const realDist = calculateDistanceKm(userLocation.lat, userLocation.lng, pro.lat, pro.lng);
        return {
          ...pro,
          lat: approxLat,
          lng: approxLng,
          liveDistanceKm: realDist,
          liveEtaMinutes: calculateEtaMinutes(realDist)
        };
      })
      .slice(0, 40);
  }, [providers, activeJob, activeCategoryFilter, userLocation]);

  const hasActiveJob = Boolean(
    activeJob && 
    activeJob.status !== 'requested' && 
    activeJob.status !== 'no_providers_available' &&
    activeJob.provider
  );

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      
      {/* ------------------------------------------------------------- */}
      {/* LEAFLET MAP CANVAS                                             */}
      {/* ------------------------------------------------------------- */}
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={14}
        zoomControl={false}
        attributionControl={true}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
      >
        {/* Clean OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Camera Controller */}
        <MapCameraController
          userCoords={userLocation}
          routeCoords={routeCoordinates}
          recenterTrigger={recenterCount}
          hasActiveJob={hasActiveJob}
        />

        {/* User Location Blue Dot & Accuracy Circle */}
        <Marker 
          position={[userLocation.lat, userLocation.lng]} 
          icon={createUserLocationIcon()} 
        />
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={locationAccuracy}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#93c5fd',
            fillOpacity: 0.18,
            weight: 1
          }}
        />

        {/* Active Job Provider Marker & OSRM Driving Route Line */}
        {hasActiveJob && (
          <>
            <Marker
              position={[
                providerLocation?.lat || activeJob.provider.lat,
                providerLocation?.lng || activeJob.provider.lng
              ]}
              icon={createActiveAssignedProviderIcon(activeJob.provider.name)}
            />

            {routeCoordinates.length > 0 && (
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: '#047857',
                  weight: 5,
                  opacity: 0.9,
                  dashArray: routeInfo?.isFallback ? '6, 8' : undefined
                }}
              />
            )}
          </>
        )}

        {/* Available Nearby Workers with Cluster Group */}
        {!hasActiveJob && (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            maxClusterRadius={40}
          >
            {visibleProviders.map((worker) => (
              <Marker
                key={worker.id}
                position={[worker.lat, worker.lng]}
                icon={createProviderMarkerIcon(worker.category, selectedWorker?.id === worker.id)}
                eventHandlers={{
                  click: () => {
                    onSelectProvider?.(worker);
                  }
                }}
              />
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>

      {/* ------------------------------------------------------------- */}
      {/* MAP CONTROLS ON RIGHT (Carefully aligned, never blocked)       */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute right-3.5 top-24 z-20 flex flex-col gap-2">
        {/* Locate Me Crosshair Button */}
        <button
          onClick={handleLocateMe}
          className={`w-11 h-11 bg-white rounded-2xl shadow-lg border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-emerald-700 transition active:scale-95 ${
            isLocating ? 'ring-2 ring-emerald-500 animate-pulse' : ''
          }`}
          title="Center on my doorstep GPS"
          aria-label="Locate me"
        >
          <Crosshair className={`w-5 h-5 text-emerald-700 ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        {/* Zoom In & Out */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/90 flex flex-col overflow-hidden">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="w-11 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-50 font-black text-base border-b border-slate-100"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="w-11 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-50 font-black text-base"
            title="Zoom out"
          >
            −
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ACTIVE JOB LIVE TRACKER BANNER                                */}
      {/* ------------------------------------------------------------- */}
      {hasActiveJob && (
        <div className="absolute top-3 left-3 right-3 z-30 max-w-md mx-auto pointer-events-auto animate-in slide-in-from-top-3 duration-300">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-500/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                🛵
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">
                  {activeJob.provider.name} is on the way
                </h4>
                <p className="text-[11px] text-emerald-200 flex items-center gap-1 font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>
                    ETA {routeInfo ? `~${routeInfo.durationMinutes} mins` : `${providerLocation?.etaMinutes || 6} mins`} ({routeInfo ? `${routeInfo.distanceKm} km` : '1.2 km'})
                  </span>
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
              Live GPS
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SELECTED WORKER BOTTOM CARD (When marker is tapped on map)     */}
      {/* ------------------------------------------------------------- */}
      {selectedWorker && !hasActiveJob && (
        <div className="absolute bottom-36 md:bottom-6 left-3 right-3 z-35 max-w-sm mx-auto pointer-events-auto animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-white rounded-3xl p-4 shadow-2xl border border-slate-200 relative">
            <button
              onClick={onClearSelectedWorker}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mb-3">
              <img
                src={selectedWorker.avatar}
                alt={selectedWorker.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">{selectedWorker.name}</h4>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-md uppercase">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 capitalize">
                  {selectedWorker.category.replace('_', ' ')} • {selectedWorker.experienceYears}y exp
                </p>
                <div className="flex items-center gap-2 text-[11px] mt-0.5">
                  <span className="text-amber-600 font-bold flex items-center">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 mr-0.5" />
                    {selectedWorker.rating}
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                    <Repeat className="w-3 h-3" />
                    {selectedWorker.repeatCustomers} repeats
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
              <span>Distance: <strong>{selectedWorker.liveDistanceKm || selectedWorker.distanceKm} km away</strong></span>
              <span>ETA: <strong>~{selectedWorker.liveEtaMinutes || selectedWorker.etaMinutes} mins</strong></span>
            </div>

            <button
              onClick={() => onSelectProvider?.(selectedWorker)}
              className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md shadow-emerald-700/25 active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <span>Book {selectedWorker.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LOCATION PERMISSION PROMPT MODAL (Only shown once)             */}
      {/* ------------------------------------------------------------- */}
      {showPermissionDialog && hasLocationPermission === null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-100 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <Navigation className="w-7 h-7 text-emerald-700 animate-pulse" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Find Verified Workers Near You
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Allow location so Verifix can match you with the nearest verified technicians in ~15 minutes.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowPermissionDialog(false);
                  startWatchingPosition();
                }}
                className="w-full h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-lg shadow-emerald-700/30 active:scale-95 transition"
              >
                Allow Location Access
              </button>
              <button
                onClick={() => {
                  setShowPermissionDialog(false);
                  setHasLocationPermission('denied');
                  sessionStorage.setItem('verifix_loc_permission', 'denied');
                }}
                className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
