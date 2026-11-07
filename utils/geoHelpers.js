/**
 * Geospatial calculation helpers for Verifix
 */

// Calculate Haversine distance in kilometers between two lat/lng coordinates
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Check if user moved more than a given threshold in meters (default 20m)
export function hasMovedSignificantly(prevCoords, newCoords, thresholdMeters = 20) {
  if (!prevCoords || !newCoords) return true;
  const distKm = calculateDistanceKm(
    prevCoords.lat,
    prevCoords.lng,
    newCoords.lat,
    newCoords.lng
  );
  return distKm * 1000 >= thresholdMeters;
}

// Approximate coordinates for unassigned provider privacy (round to 3 decimals ~ 110m blur)
export function roundForPrivacy(coord, decimals = 3) {
  if (coord === undefined || coord === null) return coord;
  return Number(Number(coord).toFixed(decimals));
}

// Calculate ETA in minutes based on distance (~4-5 mins per km in city traffic + 2 min prep)
export function calculateEtaMinutes(distanceKm) {
  return Math.max(3, Math.round(distanceKm * 4.5 + 2));
}
