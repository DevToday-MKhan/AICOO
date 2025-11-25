// API Configuration
// In development: Vite proxy handles /api -> http://localhost:3000
// In production: Use VITE_API_URL environment variable
const API_BASE = import.meta.env.VITE_API_URL || '';

// Helper to build API URL
// Development: '/api/...' (proxied by Vite)
// Production: 'https://backend.railway.app/api/...' (full URL)
export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

// WebSocket URL for real-time updates
export const WS_URL = API_BASE 
  ? API_BASE.replace('http', 'ws') 
  : `ws://localhost:3000`;

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
