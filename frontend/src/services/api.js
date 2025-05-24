import axios from 'axios';

// Use environment variable for API URL
let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Ensure API_URL doesn't have a trailing slash
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to false for cross-domain requests
});

// Log configuration for debugging
console.debug(`API Client initialized with baseURL: ${API_URL}`);

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.debug(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ensure all URLs end with trailing slash for Django REST Framework
    if (!config.url.endsWith('/')) {
      config.url = `${config.url}/`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.debug(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
      
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optional: Redirect to login page
        // window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api; 