import axios from 'axios';

// Determine base URL based on environment
const getBaseUrl = () => {
  // In production on Vercel, use the same domain
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  return (import.meta.env.VITE_API_URL || 'http://localhost:8000');
};

// Create base config for API calls
export const apiConfig = {
  baseURL: getBaseUrl(),
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
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    
    // Debug logging
    console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.status);
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
      console.error(`❌ Error ${error.response.status} from ${error.config.url}:`, 
                   error.response.data);
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Request failed:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
