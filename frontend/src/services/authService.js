import api from './api';

/**
 * Authentication service for handling user login, registration, and session management
 */
const authService = {
  /**
   * Login a user with email and password
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} - User data and token
   */
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await api.post('/api/auth/login', credentials);
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - New user data and token
   */
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Log out the current user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      // Call logout endpoint if it exists
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  /**
   * Get the current authenticated user
   * @returns {Promise<Object>} - User data
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/user');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Get the current user from localStorage
   * @returns {Object|null}
   */
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  /**
   * Get authentication token
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService; 