import L from 'leaflet';

/**
 * Custom Leaflet Marker Icons Factory for Verifix
 * Fixes Leaflet's default image path 404 bugs by using pure vector SVG divIcons.
 */

// 1. Customer User Location (Blue pulsing dot with light blue ring)
export function createUserLocationIcon() {
  return L.divIcon({
    className: 'verifix-user-location-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 36px; height: 36px; background-color: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position: absolute; width: 20px; height: 20px; background-color: #2563eb; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></span>
        <span style="position: absolute; width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%;"></span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

// 2. Verified Service Provider Pin (Category colored circle + icon + verified checkmark badge)
const CATEGORY_COLORS = {
  plumber: { bg: '#0284c7', icon: '🔧' },      // Sky blue
  electrician: { bg: '#eab308', icon: '⚡' },  // Amber/yellow
  ac_repair: { bg: '#06b6d4', icon: '❄️' },    // Cyan
  tutor: { bg: '#8b5cf6', icon: '📚' },        // Purple
  carpenter: { bg: '#d97706', icon: '🪚' },    // Wood amber
  painter: { bg: '#ec4899', icon: '🎨' },      // Pink
  default: { bg: '#047857', icon: '🛠️' }
};

export function createProviderMarkerIcon(category = 'default', isSelected = false) {
  const config = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
  const size = isSelected ? 42 : 36;
  const anchor = size / 2;

  return L.divIcon({
    className: 'verifix-provider-pin',
    html: `
      <div style="
        position: relative; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        background-color: ${config.bg}; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        border: 2.5px solid #ffffff; 
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); 
        cursor: pointer;
        transition: transform 0.2s ease;
        ${isSelected ? 'transform: scale(1.15); ring: 3px solid #047857;' : ''}
      ">
        <span style="font-size: ${isSelected ? '18px' : '15px'}; line-height: 1;">${config.icon}</span>
        
        <!-- Small Green Verified Checkmark Tick -->
        <span style="
          position: absolute; 
          top: -2px; 
          right: -2px; 
          width: 14px; 
          height: 14px; 
          background-color: #047857; 
          border-radius: 50%; 
          border: 2px solid #ffffff; 
          display: flex; 
          align-items: center; 
          justify-content: center;
        ">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor]
  });
}

// 3. Active Assigned Provider Pin (during active job with transit pulsing)
export function createActiveAssignedProviderIcon(providerName) {
  return L.divIcon({
    className: 'verifix-active-pro-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <!-- Vehicle & Radar Ping -->
        <div style="
          width: 44px; 
          height: 44px; 
          background: linear-gradient(135deg, #047857, #065f46); 
          border-radius: 50%; 
          border: 3px solid #ffffff; 
          box-shadow: 0 6px 18px rgba(4, 120, 87, 0.45); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          position: relative;
        ">
          <span style="font-size: 20px;">🛵</span>
          <span style="position: absolute; inset: -4px; border: 2px solid #10b981; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        </div>
        
        <!-- Name Callout Badge -->
        <div style="
          margin-top: 3px; 
          background: #0f172a; 
          color: #ffffff; 
          font-family: sans-serif; 
          font-weight: 800; 
          font-size: 10px; 
          padding: 2px 6px; 
          border-radius: 6px; 
          white-space: nowrap; 
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        ">
          ${providerName || 'Pro On Way'}
        </div>
      </div>
    `,
    iconSize: [44, 60],
    iconAnchor: [22, 50]
  });
}

// 4. Doorstep Customer Pin
export function createCustomerDoorstepIcon() {
  return L.divIcon({
    className: 'verifix-doorstep-pin',
    html: `
      <div style="
        width: 36px; 
        height: 36px; 
        background: #047857; 
        border-radius: 50%; 
        border: 3px solid #ffffff; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        box-shadow: 0 4px 14px rgba(4, 120, 87, 0.4); 
        position: relative;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background-color: #047857; border-radius: 50%;"></span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

// 5. Cluster Icon for react-leaflet-cluster
export function createClusterCustomIcon(cluster) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 36 : count < 25 ? 42 : 48;
  
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px; 
        height: ${size}px; 
        background: rgba(4, 120, 87, 0.9); 
        border: 3px solid #ffffff; 
        border-radius: 50%; 
        color: #ffffff; 
        font-family: sans-serif; 
        font-weight: 800; 
        font-size: ${size > 40 ? 14 : 12}px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        box-shadow: 0 4px 16px rgba(4, 120, 87, 0.35);
      ">
        ${count}
      </div>
    `,
    className: 'verifix-marker-cluster',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}
