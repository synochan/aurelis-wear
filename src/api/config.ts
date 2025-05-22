
// Configuration for API calls to Django backend
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiConfig = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  
  return response.json();
};

// Helper function to get auth token (to be implemented with auth logic)
export const getAuthToken = () => {
  return localStorage.getItem('authToken') || '';
};

// Add auth headers to requests that need authentication
export const withAuth = (headers = {}) => {
  const token = getAuthToken();
  return token ? { ...headers, 'Authorization': `Bearer ${token}` } : headers;
};
