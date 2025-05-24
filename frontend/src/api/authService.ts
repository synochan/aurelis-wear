import api from './config';
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

export const authService = {
    // Login user
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      try {
        console.log('Attempting to login with:', credentials.email);
        
        // Use axios directly for more control
        const baseUrl = api.defaults.baseURL || '';
        const url = `${baseUrl}/api/auth/login/`;
        console.log('Login URL:', url);
        
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
        console.log('Login successful:', data);
        
        // Store auth token in localStorage for subsequent requests
        if (data.token) {
          localStorage.setItem('token', data.token);
          // Also store user in memory
          currentUser = data.user;
        }
        
        return data;
      } catch (error: any) {
        console.error('Login error details:', error.response?.data || error.message);
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
        
        console.log('Registering with username:', username);
        
        const registerData = {
          username: username,
          email: userData.email,
          password: userData.password,
          password2: userData.password, // Confirm password is required
          first_name: userData.firstName,
          last_name: userData.lastName
        };
        
        console.log('Registration data:', registerData);
        
        // Use axios directly for more control
        const baseUrl = api.defaults.baseURL || '';
        const url = `${baseUrl}/api/auth/register/`;
        console.log('Registration URL:', url);
        
        const response = await axios({
          method: 'post',
          url: url,
          data: registerData,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const data = response.data;
        console.log('Registration successful:', data);
        
        // Store auth token in localStorage for subsequent requests
        if (data.token) {
          localStorage.setItem('token', data.token);
          // Also store user in memory
          currentUser = data.user;
        }
        
        return data;
      } catch (error: any) {
        console.error('Registration error details:', error.response?.data || error.message);
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
        const response = await api.get('/api/auth/user/');
        
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
        
        const response = await api.patch('/api/auth/user/', profileData);
        
        const data = response.data;
        // Update the cached user data
        currentUser = data;
        return data;
      } catch (error) {
        throw error;
      }
    }
};