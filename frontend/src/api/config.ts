// Configuration for API calls to Django backend
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiConfig = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to format detailed error messages from Django's response format
const formatErrorMessage = (errorData: any): string => {
  if (!errorData) return 'Unknown error occurred';
  
  // Check if it's a Django detailed error object
  if (typeof errorData === 'object') {
    // Handle field-specific errors
    const errorMessages: string[] = [];
    
    Object.entries(errorData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        errorMessages.push(`${key}: ${value.join(', ')}`);
      } else if (typeof value === 'string') {
        errorMessages.push(`${key}: ${value}`);
      }
    });
    
    if (errorMessages.length > 0) {
      return errorMessages.join('; ');
    }
    
    // Handle non-field errors or detail message
    if (errorData.non_field_errors) {
      return errorData.non_field_errors.join(', ');
    }
    
    if (errorData.detail) {
      return errorData.detail;
    }
    
    // If we can't extract a structured error, convert the object to a string
    return JSON.stringify(errorData);
  }
  
  // If it's already a string message
  if (typeof errorData === 'string') {
    return errorData;
  }
  
  return 'Unknown error format';
};

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = formatErrorMessage(errorData);
    throw new Error(errorMessage || `API Error: ${response.status}`);
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
  // Django REST Framework expects the format "Token xxxxxxx" not "Bearer xxxxxxx"
  return token ? { ...headers, 'Authorization': `Token ${token}` } : headers;
};
