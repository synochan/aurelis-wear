import axios from 'axios';

// Determine base URL based on environment
const getBaseUrl = () => {
  // In production on Vercel, use the deployed backend URL
  if (import.meta.env.PROD) {
    // Use the API_URL environment variable or fallback to the frontend domain
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      console.log('Using configured API URL:', apiUrl);
      return apiUrl;
    }
    
    // If no API_URL is set, use the same domain as the frontend
    // This works only if both frontend and backend are on the same domain
    console.log('Using window.location.origin as API URL:', window.location.origin);
    return window.location.origin;
  }
  
  // In development, use the configured API URL or localhost
  const devUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  console.log('Using development API URL:', devUrl);
  return devUrl;
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

// Calculate the API base URL
const apiBaseUrl = getBaseUrl();
console.log('API Base URL:', apiBaseUrl);

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    
    // Debug logging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🚀 Request: ${config.method?.toUpperCase()} ${fullUrl}`, config.data);
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
