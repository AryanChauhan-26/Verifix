/**
 * Routing Service using public Open Source Routing Machine (OSRM)
 * Returns driving route geometry between provider and customer
 */

const routeCache = new Map();

export async function fetchDrivingRoute(startLat, startLng, endLat, endLng) {
  if (!startLat || !startLng || !endLat || !endLng) {
    return null;
  }

  const cacheKey = `${startLat.toFixed(4)},${startLng.toFixed(4)}_${endLat.toFixed(4)},${endLng.toFixed(4)}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM error: ${response.status}`);
    }

    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
      const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const distanceKm = Number((route.distance / 1000).toFixed(1));
      const durationMinutes = Math.max(2, Math.round(route.duration / 60));

      const result = {
        coordinates,
        distanceKm,
        durationMinutes,
        isFallback: false
      };

      routeCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn('[Routing] OSRM public API unreachable, using straight line interpolation:', err.message);
  }

  // Fallback: Generate dashed straight line with midpoints
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;
  const dist = Math.hypot(endLat - startLat, endLng - startLng) * 111;

  return {
    coordinates: [
      [startLat, startLng],
      [midLat, midLng],
      [endLat, endLng]
    ],
    distanceKm: Number(dist.toFixed(1)),
    durationMinutes: Math.max(3, Math.round(dist * 4 + 2)),
    isFallback: true
  };
}
