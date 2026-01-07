/**
 * Backend health check service
 * Detects backend availability and manages fallback to mock data
 */
import axios from 'axios';

const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
let isBackendAvailable = true;
let healthCheckInterval = null;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 5000,
});

/**
 * Check if backend is available
 */
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 3000 });
    const wasAvailable = isBackendAvailable;
    isBackendAvailable = response.status === 200 && response.data.status === 'healthy';
    
    // Notify if status changed
    if (wasAvailable !== isBackendAvailable) {
      console.log(`Backend status changed: ${isBackendAvailable ? 'available' : 'unavailable'}`);
      // Dispatch custom event for components to listen
      window.dispatchEvent(new CustomEvent('backend-status-changed', {
        detail: { available: isBackendAvailable }
      }));
    }
    
    return isBackendAvailable;
  } catch (error) {
    const wasAvailable = isBackendAvailable;
    isBackendAvailable = false;
    
    if (wasAvailable !== isBackendAvailable) {
      console.log('Backend became unavailable, switching to demo mode');
      window.dispatchEvent(new CustomEvent('backend-status-changed', {
        detail: { available: false }
      }));
    }
    
    return false;
  }
};

/**
 * Start periodic health checks
 */
export const startHealthChecks = () => {
  if (healthCheckInterval) {
    return; // Already running
  }
  
  // Check immediately
  checkBackendHealth();
  
  // Then check periodically
  healthCheckInterval = setInterval(checkBackendHealth, HEALTH_CHECK_INTERVAL);
};

/**
 * Stop periodic health checks
 */
export const stopHealthChecks = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
};

/**
 * Get current backend availability status
 */
export const isBackendHealthy = () => {
  return isBackendAvailable;
};

// Auto-start health checks when module loads
if (typeof window !== 'undefined') {
  startHealthChecks();
}

export default {
  checkBackendHealth,
  startHealthChecks,
  stopHealthChecks,
  isBackendHealthy
};

