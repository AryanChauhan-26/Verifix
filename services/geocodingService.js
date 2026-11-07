/**
 * Reverse Geocoding Service using OpenStreetMap Nominatim
 * Compliant with Nominatim Usage Policy:
 * - Valid User-Agent header
 * - Maximum 1 request per second (rate-limited queue)
 * - In-memory and localStorage response caching
 */

const CACHE_KEY_PREFIX = 'verifix_geo_cache_';
const memoryCache = new Map();

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1s to safely respect 1 req/sec limit

// Fallback localities dictionary for instant offline resolution
const KNOWN_AREAS = [
  { lat: 12.9716, lng: 77.6412, name: 'Indiranagar 100ft Rd, Bengaluru' },
  { lat: 12.9352, lng: 77.6245, name: 'Koramangala 4th Block, Bengaluru' },
  { lat: 12.9121, lng: 77.6446, name: 'HSR Layout Sector 1, Bengaluru' },
  { lat: 19.0596, lng: 72.8295, name: 'Bandra West, Mumbai' },
  { lat: 28.5355, lng: 77.2410, name: 'Greater Kailash, South Delhi' }
];

export async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return null;

  // Key rounded to 3 decimal places (~100m) for high cache hit rate
  const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}`;

  // 1. Check in-memory cache
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  // 2. Check localStorage cache
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      memoryCache.set(cacheKey, parsed);
      return parsed;
    }
  } catch (e) {
    // Ignore storage errors
  }

  // 3. Rate-limit enforcement: Wait if less than 1.1s has elapsed since last request
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLast));
  }
  lastRequestTime = Date.now();

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'VerifixHomeServicesApp/1.0 (verifix.hyperlocal@gmail.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    // Build clean human-friendly Indian address
    const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.commercial;
    const road = addr.road || addr.street;
    const city = addr.city || addr.town || addr.state_district || 'Bengaluru';
    const state = addr.state;

    let formattedAddress = '';
    if (road && suburb) {
      formattedAddress = `${road}, ${suburb}`;
    } else if (suburb) {
      formattedAddress = `${suburb}, ${city}`;
    } else if (data.display_name) {
      // Pick first 2 components of display_name
      const parts = data.display_name.split(',').map((p) => p.trim());
      formattedAddress = parts.slice(0, 2).join(', ');
    } else {
      formattedAddress = `${city}, ${state || 'India'}`;
    }

    const result = {
      displayName: formattedAddress,
      suburb: suburb || city,
      city,
      fullDetails: data
    };

    // Cache the result
    memoryCache.set(cacheKey, result);
    try {
      localStorage.setItem(CACHE_KEY_PREFIX + cacheKey, JSON.stringify(result));
    } catch {}

    return result;
  } catch (err) {
    console.warn('[Geocoding] Nominatim fetch failed or rate-limited, using fallback:', err.message);

    // Fallback: check closest known area
    for (const known of KNOWN_AREAS) {
      const d = Math.hypot(known.lat - lat, known.lng - lng);
      if (d < 0.05) {
        return { displayName: known.name, suburb: known.name.split(',')[0], city: 'Bengaluru' };
      }
    }

    return {
      displayName: `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      suburb: 'Nearby Locality',
      city: 'Bengaluru'
    };
  }
}
