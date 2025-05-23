import axios from 'axios';

// Determine base URL based on environment
const getBaseUrl = () => {
  // In production on Vercel, always use the dedicated backend URL
  if (import.meta.env.PROD) {
    // Use the hardcoded backend URL to ensure consistency
    const backendUrl = 'https://aurelis-wear-api.vercel.app';
    console.log('[config] Using hardcoded backend URL:', backendUrl);
    return backendUrl;
  }
  
  // In development, use the configured API URL or localhost
  const devUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  console.log('[config] Using development API URL:', devUrl);
  return devUrl;
};

// Helper to ensure all API paths have the /api prefix
const ensureApiPath = (path: string) => {
  if (!path.startsWith('/api') && !path.startsWith('api/')) {
    return `/api${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path;
};

// Calculate the API base URL
const apiBaseUrl = getBaseUrl();
console.log('[config] API Base URL:', apiBaseUrl);

// Create base config for API calls
export const apiConfig = {
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Helper function for auth headers
export const withAuth = (headers = {}) => {
  const token = localStorage.getItem('token');
  if (token) {
    return {
      ...headers,
      'Authorization': `Token ${token}`
    };
  }
  return headers;
};

// Helper to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    // For 401 errors, handle authentication issues
    if (response.status === 401) {
      localStorage.removeItem('token');
    }
    
    // Try to get error details from response
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(response.statusText);
    }
    
    // Throw error with message from API if available
    if (errorData && errorData.detail) {
      throw new Error(errorData.detail);
    }
    throw new Error(response.statusText);
  }
  
  return response.json();
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Ensure path has /api prefix
    if (config.url) {
      config.url = ensureApiPath(config.url);
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    
    // Debug logging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[config] Request: ${config.method?.toUpperCase()} ${fullUrl}`, config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[config] Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Error logging
    if (error.response) {
      console.error(`[config] Error ${error.response.status} from ${error.config.url}:`, 
                   error.response.data);
    } else if (error.request) {
      console.error('[config] No response received:', error.request);
    } else {
      console.error('[config] Request failed:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
