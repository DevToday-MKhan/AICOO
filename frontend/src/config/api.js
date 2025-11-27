// API Configuration
// Uses window.ENV.API_BASE_URL set by Remix SSR
// Falls back to empty string for development (same origin)
const API_BASE = typeof window !== 'undefined' && window.ENV?.API_BASE_URL 
  ? window.ENV.API_BASE_URL 
  : '';

// Helper to build API URL
export function apiUrl(path) {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

// Helper for fetch calls with automatic URL construction
export async function apiFetch(path, options = {}) {
  const url = apiUrl(path);
  return fetch(url, options);
}

// WebSocket URL for real-time updates
export const WS_URL = API_BASE 
  ? API_BASE.replace('http', 'ws') 
  : (typeof window !== 'undefined' ? `ws://${window.location.host}` : 'ws://localhost:8080');

// API Endpoints - using helper for environment-aware URLs
export const ENDPOINTS = {
  // Health & Status
  health: () => apiUrl('/api/health'),
  
  // Courier & Delivery
  courier: () => apiUrl('/api/courier'),
  rates: () => apiUrl('/api/courier/rates'),
  label: () => apiUrl('/api/courier/label'),
  track: () => apiUrl('/api/courier/track'),
  validateAddress: () => apiUrl('/api/courier/validate-address'),
  
  // Webhooks
  webhooks: () => apiUrl('/api/webhooks'),
  shopifyWebhooks: () => apiUrl('/api/webhooks/shopify'),
  
  // Analytics & Memory
  analytics: () => apiUrl('/api/analytics'),
  memory: () => apiUrl('/api/memory'),
  carrierPerformance: () => apiUrl('/api/memory/carrier-performance'),
  
  // Admin
  admin: () => apiUrl('/api/admin'),
  credentials: (carrier) => apiUrl(`/api/admin/credentials/${carrier}`),
  
  // Shopify Integration
  shopify: () => apiUrl('/api/shopify'),
  
  // Chat & AI
  chat: () => apiUrl('/api/chat'),
};

// Helper function to check if backend is reachable
export async function checkBackendHealth() {
  try {
    const response = await fetch(apiUrl('/api/health'));
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}
