import api from '../config';
import axios from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  }
}

// Store user data in memory
let currentUser: any = null;

// Get the backend URL
const getBackendUrl = () => {
  // First check for a specific environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production, use the dedicated Render backend URL
  if (import.meta.env.PROD && !window.location.hostname.includes('localhost')) {
    return 'https://aurelis-wear-api.onrender.com/api';
  }
  
  // Default to localhost
  return 'http://localhost:8000/api';
};

// Ensure path has /api prefix
const ensureApiPath = (path: string) => {
  // Check if the backend URL already includes '/api'
  const backendUrl = getBackendUrl();
  const hasApiSuffix = backendUrl.endsWith('/api');
  
  // If backend URL already has '/api' suffix, don't add it again
  if (hasApiSuffix) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  
  // Otherwise follow the original logic
  if (!path.startsWith('/api') && !path.startsWith('api/')) {
    return `/api${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path;
};

const BACKEND_URL = getBackendUrl();

export const authService = {
    // Login user
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      try {
        console.log('[auth] Attempting to login with:', credentials.email);
        
        // Use direct axios call with full URL
        const loginPath = ensureApiPath('/auth/login/');
        const url = `${BACKEND_URL}${loginPath}`;
        console.log('[auth] Login URL:', url);
        
        const response = await axios({
          method: 'post',
          url: url,
          data: {
            email: credentials.email,
            password: credentials.password
          },
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = response.data;
        console.log('[auth] Login successful:', data);
        
        // Store auth token in localStorage for subsequent requests
        if (data.token) {
          localStorage.setItem('token', data.token);
          // Also store user in memory
          currentUser = data.user;
        }
        
        return data;
      } catch (error: any) {
        console.error('[auth] Login error details:', error.response?.data || error.message);
        // Clear any partial auth data on error
        localStorage.removeItem('token');
        currentUser = null;
        throw error;
      }
    },
  
    // Register new user
    register: async (userData: RegisterData): Promise<AuthResponse> => {
      try {
        // Generate username from email (use part before @)
        const username = userData.email.split('@')[0];
        
        console.log('[auth] Registering with username:', username);
        
        // Match the field names expected by the backend handler
        const registerData = {
          username: username,
          email: userData.email,
          password: userData.password,
          password2: userData.password, // Confirm password is required
          first_name: userData.firstName,
          last_name: userData.lastName
        };
        
        console.log('[auth] Registration data:', registerData);
        
        // Use direct axios call with full URL
        const registerPath = ensureApiPath('/auth/register/');
        const url = `${BACKEND_URL}${registerPath}`;
        console.log('[auth] Registration URL:', url);
        
        const response = await axios({
          method: 'post',
          url: url,
          data: registerData,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = response.data;
        console.log('[auth] Registration successful:', data);
        
        // Store auth token in localStorage for subsequent requests
        if (data.token) {
          localStorage.setItem('token', data.token);
          // Also store user in memory
          currentUser = data.user;
        }
        
        return data;
      } catch (error: any) {
        console.error('[auth] Registration error details:', error.response?.data || error.message);
        // Clear any partial auth data on error
        localStorage.removeItem('token');
        currentUser = null;
        throw error;
      }
    },
  
    // Logout user (client-side only)
    logout: () => {
      // Clear local storage and memory cache
      localStorage.removeItem('token');
      currentUser = null;
    },
  
    // Check if user is authenticated
    isAuthenticated: () => {
      return !!localStorage.getItem('token');
    },
  
    // Get current user's profile
    getCurrentUser: async () => {
      // Return cached user if available
      if (currentUser) return currentUser;
      
      // If no token, don't even try to fetch
      if (!localStorage.getItem('token')) {
        throw new Error('Not authenticated');
      }
      
      try {
        const userPath = ensureApiPath('/auth/user/');
        const url = `${BACKEND_URL}${userPath}`;
        
        const response = await axios({
          method: 'get',
          url: url,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });
        
        const data = response.data;
        // Cache the user data
        currentUser = data;
        return data;
      } catch (error) {
        // If there's an error getting the user, it might be an auth issue
        // so clear the token just to be safe
        authService.logout();
        throw error;
      }
    },
  
    // Clear user cache (useful when testing)
    clearUserCache: () => {
      currentUser = null;
    },
  
    // Update user profile
    updateProfile: async (profileData: any) => {
      try {
        // Check if we're authenticated first
        if (!authService.isAuthenticated()) {
          throw new Error('Not authenticated');
        }
        
        const userPath = ensureApiPath('/auth/user/');
        const url = `${BACKEND_URL}${userPath}`;
        
        const response = await axios({
          method: 'patch',
          url: url,
          data: profileData,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });
        
        const data = response.data;
        // Update the cached user data
        currentUser = data;
        return data;
      } catch (error) {
        throw error;
      }
    }
}; 