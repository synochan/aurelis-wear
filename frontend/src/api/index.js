// Re-export API components for easier importing
import api from './config';
export default api;

// Export other API modules as needed
export * from './hooks';
export * from './authService';
export * from './cartService';
export * from './productService';

// Re-export hooks as a namespace as well for compatibility
import * as hooks from './hooks';
export { hooks }; 