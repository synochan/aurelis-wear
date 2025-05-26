import axios from 'axios';

// Get the API URL with fallback
const getApiUrl = () => {
  // In production, use the dedicated Render backend URL
  if (import.meta.env.PROD && !window.location.hostname.includes('localhost')) {
    return 'https://aurelis-wear-api.onrender.com';
  }
  
  // Default to localhost for development
  return 'http://localhost:8000';
};

// Calculate API base URL once
const apiBaseUrl = getApiUrl();

// Create axios instance - DO NOT include /api in the baseURL
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // Increased to 30 second timeout for slow servers
});

// Add a request interceptor to attach auth token and handle paths
apiClient.interceptors.request.use(
  (config) => {
    if (config.url) {
      let path = config.url;
      // Only prepend /api if not already present
      if (!path.startsWith('/api/')) {
        // Ensure path starts with slash
        if (!path.startsWith('/')) {
          path = '/' + path;
        }
        path = '/api' + path;
      }
      config.url = path;
    }
    // Attach auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    console.log(`Making request to: ${config.baseURL}${config.url}`, config.params);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token on authentication errors
      localStorage.removeItem('token');
    }
    
    console.error('API Error:', error.message, error.config?.url, error.response?.status);
    return Promise.reject(error);
  }
); 