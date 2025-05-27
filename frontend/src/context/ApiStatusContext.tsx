import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiStatusContextType {
  isApiDown: boolean;
  setApiDown: (isDown: boolean) => void;
}

const ApiStatusContext = createContext<ApiStatusContextType | undefined>(undefined);

interface ApiStatusProviderProps {
  children: ReactNode;
}

/**
 * Provider component that exposes the API status to all components in the app
 */
export const ApiStatusProvider: React.FC<ApiStatusProviderProps> = ({ children }) => {
  const [isApiDown, setIsApiDown] = useState(false);

  // Expose the setApiDown function for external services to update
  const setApiDown = (isDown: boolean) => {
    if (isDown !== isApiDown) {
      console.log(`API status changed: ${isDown ? 'DOWN' : 'UP'}`);
      setIsApiDown(isDown);
    }
  };

  // Subscribe to localStorage events to sync API status across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'api_status') {
        const newStatus = e.newValue === 'down';
        setIsApiDown(newStatus);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // When API status changes, update localStorage
  useEffect(() => {
    localStorage.setItem('api_status', isApiDown ? 'down' : 'up');
  }, [isApiDown]);

  return (
    <ApiStatusContext.Provider value={{ isApiDown, setApiDown }}>
      {children}
    </ApiStatusContext.Provider>
  );
};

/**
 * Hook to use the API status
 */
export const useApiStatus = (): ApiStatusContextType => {
  const context = useContext(ApiStatusContext);
  if (context === undefined) {
    throw new Error('useApiStatus must be used within an ApiStatusProvider');
  }
  return context;
};

export default ApiStatusProvider; 