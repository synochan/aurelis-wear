import axios from 'axios';

// Determine base URL based on environment
const getBaseUrl = () => {
  // First check for a specific environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production, use the dedicated Render backend URL
  if (import.meta.env.PROD && !window.location.hostname.includes('localhost')) {
    // Use the Render backend URL
    const backendUrl = 'https://aurelis-wear-api.onrender.com';
    return backendUrl;
  }
  
  // Default to localhost for any other case
  return 'http://localhost:8000';
};

// Helper to ensure all API paths have the /api prefix
const ensureApiPath = (path: string) => {
  // If the path already starts with /api, don't modify it
  // (No longer needed: axios client handles /api prefixing robustly)
  return path.startsWith('/') ? path : `/${path}`;
};

// Calculate the API base URL
const apiBaseUrl = getBaseUrl();

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
  // Add explicit configuration for redirects
  maxRedirects: 5,
  withCredentials: true, // Important for CORS with credentials
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Ensure path has /api prefix
    if (config.url) {
      let url = ensureApiPath(config.url);
      
      // Ensure trailing slash for API paths to avoid redirects
      if (!url.endsWith('/') && !url.includes('?')) {
        url = `${url}/`;
      }
      
      config.url = url;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
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
    
    return Promise.reject(error);
  }
);

export default api;
