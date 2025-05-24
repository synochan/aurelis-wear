import axios from 'axios';

// Get the API URL with fallback
const getApiUrl = () => {
  try {
    // In production on Vercel, use the same domain
    if (import.meta.env.PROD) {
      return window.location.origin;
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  } catch (error) {
    console.warn('Environment variables not available, using default API URL');
    return 'http://localhost:8000';
  }
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config) => {
    // Log requests in development
    console.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 
      config.params || {}, config.data || {});
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    console.debug(`API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear token on authentication errors
      localStorage.removeItem('token');
      console.warn('Authentication token expired or invalid');
      // We could redirect to login here if needed
    }
    
    // Log all API errors
    console.error('API response error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
); 