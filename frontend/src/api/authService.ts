import axios from 'axios';
import { apiClient } from './client';

// Keep track of the current user
let currentUser: any = null;

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

export const authService = {
    // Login user
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      try {
        console.log('[auth] Attempting to login with:', credentials.email);
        
        const response = await apiClient.post('/auth/login/', {
          email: credentials.email,
          password: credentials.password
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
        
        const response = await apiClient.post('/auth/register/', registerData);
        
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
        const response = await apiClient.get('/auth/user/');
        
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
        
        const response = await apiClient.patch('/auth/user/', profileData);
        
        const data = response.data;
        // Update the cached user data
        currentUser = data;
        return data;
      } catch (error) {
        throw error;
      }
    }
};