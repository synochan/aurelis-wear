
import { apiConfig, handleApiResponse } from './config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${apiConfig.baseURL}/auth/login/`, {
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
    }
    
    return data;
  },
  
  // Register new user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${apiConfig.baseURL}/auth/register/`, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName
      })
    });
    
    const data = await handleApiResponse(response);
    
    // Store auth token in localStorage for subsequent requests
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return data;
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
  
  // Get current user's profile
  getCurrentUser: async () => {
    const response = await fetch(`${apiConfig.baseURL}/auth/user/`, {
      method: 'GET',
      headers: {
        ...apiConfig.headers,
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    return handleApiResponse(response);
  }
};
