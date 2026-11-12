/**
 * ============================================================================
 * OUTCOME-BASED LEARNING (OBL) ENGINEERING HIT: AXIOS HTTP CLIENT CONFIG
 * ============================================================================
 * WHAT IS IT?
 *   - Centralized Axios instance configured with base URL, default headers,
 *     timeout thresholds, and global response interceptors.
 * 
 * WHAT IT CAN DO?
 *   - Dispatches HTTP asynchronous promises to backend port (5000).
 *   - Intercepts incoming responses and automatically catches server-level errors
 *     (400 Bad Request, 404 Not Found, 500 Server Error) to trigger UI toasts.
 * 
 * WHY WE USE IT?
 *   - Avoids repetitive fetch boilerplates across 20+ components.
 *   - Provides a single point of failure handling and environment configuration.
 * ============================================================================
 */
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Response Interceptor for centralized error feedback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Server took too long to respond. Please refresh.');
    }
    return Promise.reject(error);
  }
);

export default api;
