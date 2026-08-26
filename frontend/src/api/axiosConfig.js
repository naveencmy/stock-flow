import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only toast on server error responses if not a network failure handled by fallback
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default api;
