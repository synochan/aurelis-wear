import { apiConfig, handleApiResponse, withAuth } from './config';

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
        const response = await fetch(`${apiConfig.baseURL}/api/auth/login/`, {
          method: 'POST',
          headers: apiConfig.headers,
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
          })
        });
        
        const data = await handleApiResponse(response);
        
        // Store auth token in localStorage for subsequent requests
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          // Also store user in memory
          currentUser = data.user;
        }
        
        return data;
      } catch (error) {
        // Clear any partial auth data on error
        localStorage.removeItem('authToken');
        currentUser = null;
        throw error;
      }
    },
  
    // Register new user
    register: async (userData: RegisterData): Promise<AuthResponse> => {
      try {
        // Generate username from email (use part before @)
        const username = userData.email.split('@')[0];
        
        const response = await fetch(`${apiConfig.baseURL}/api/auth/register/`, {
          method: 'POST',
          headers: apiConfig.headers,
          body: JSON.stringify({
            username: username,
            email: userData.email,
            password: userData.password,
            password2: userData.password, // Confirm password is required
            first_name: userData.firstName,
            last_name: userData.lastName
          })
        });
        
        const data = await handleApiResponse(response);
        
        // Store auth token in localStorage for subsequent requests
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          // Also store user in memory
          currentUser = data.user;
        }
        
        return data;
      } catch (error) {
        // Clear any partial auth data on error
        localStorage.removeItem('authToken');
        currentUser = null;
        throw error;
      }
    },
  
    // Logout user (client-side only)
    logout: () => {
      // Clear local storage and memory cache
      localStorage.removeItem('authToken');
      currentUser = null;
    },
  
    // Check if user is authenticated
    isAuthenticated: () => {
      return !!localStorage.getItem('authToken');
    },
  
    // Get current user's profile
    getCurrentUser: async () => {
      // Return cached user if available
      if (currentUser) return currentUser;
      
      // If no token, don't even try to fetch
      if (!localStorage.getItem('authToken')) {
        throw new Error('Not authenticated');
      }
      
      try {
        const response = await fetch(`${apiConfig.baseURL}/api/auth/user/`, {
          method: 'GET',
          headers: withAuth(apiConfig.headers)
        });
        
        if (response.status === 401) {
          // Token is invalid, clear it
          authService.logout();
          throw new Error('Authentication token expired or invalid');
        }
        
        const data = await handleApiResponse(response);
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
        
        const response = await fetch(`${apiConfig.baseURL}/api/auth/user/`, {
          method: 'PATCH',
          headers: withAuth(apiConfig.headers),
          body: JSON.stringify(profileData)
        });
        
        if (response.status === 401) {
          // Token is invalid, clear it
          authService.logout();
          throw new Error('Authentication token expired or invalid');
        }
        
        const data = await handleApiResponse(response);
        // Update the cached user data
        currentUser = data;
        return data;
      } catch (error) {
        // On error with auth, clear token
        if (error instanceof Response && error.status === 401) {
          authService.logout();
        }
        throw error;
      }
    }
};
