import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

// Flag to track if the component has been dismissed
let isDismissed = false;

interface ApiStatusAlertProps {
  isApiDown: boolean;
}

/**
 * Alert component that displays a message when the API is down and mock data is being used
 */
const ApiStatusAlert: React.FC<ApiStatusAlertProps> = ({ isApiDown }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if API is down and alert hasn't been dismissed
    if (isApiDown && !isDismissed) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [isApiDown]);

  if (!visible) return null;

  const handleDismiss = () => {
    isDismissed = true;
    setVisible(false);
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 fixed bottom-4 right-4 z-50 max-w-md rounded shadow-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-grow">
          <p className="text-sm text-yellow-700">
            The backend API is currently unavailable. Showing demo products instead.
          </p>
        </div>
        <button
          className="ml-auto flex-shrink-0 -mr-1 -mt-1"
          onClick={handleDismiss}
        >
          <X className="h-5 w-5 text-yellow-500" />
        </button>
      </div>
    </div>
  );
};

export default ApiStatusAlert; 