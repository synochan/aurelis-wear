import axios from 'axios';

// Get the API URL with fallback
const getApiUrl = () => {
  try {
    // In production on Vercel, always use the dedicated backend URL
    if (import.meta.env.PROD) {
      // Use a direct, hardcoded URL to ensure we always hit the backend server
      const backendUrl = 'https://aurelis-wear-api.vercel.app';
      console.log('[client] Using hardcoded backend URL:', backendUrl);
      return backendUrl;
    }
    
    // In development, use the configured API URL or localhost
    const devUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    console.log('[client] Using development API URL:', devUrl);
    return devUrl;
  } catch (error) {
    console.warn('Environment variables not available, using default API URL');
    return 'http://localhost:8000';
  }
};

// Calculate API base URL once
const apiBaseUrl = getApiUrl();
console.log('[client] API Base URL:', apiBaseUrl);

// Helper to ensure all API paths have the /api prefix
const ensureApiPath = (path: string) => {
  if (!path.startsWith('/api') && !path.startsWith('api/')) {
    return `/api${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path;
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to attach auth token and ensure proper paths
apiClient.interceptors.request.use(
  (config) => {
    // Ensure path has /api prefix
    if (config.url) {
      config.url = ensureApiPath(config.url);
    }
    
    // Log requests in development
    const fullUrl = `${config.baseURL}${config.url}`;
    console.debug(`[client] API Request: ${config.method?.toUpperCase()} ${fullUrl}`, 
      config.params || {}, config.data || {});
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('[client] API request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    console.debug(`[client] API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token on authentication errors
      localStorage.removeItem('token');
      console.warn('[client] Authentication token expired or invalid');
      // We could redirect to login here if needed
    }
    
    // Log all API errors
    console.error('[client] API response error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
); 