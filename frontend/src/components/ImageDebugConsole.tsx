import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/utils/imageUtils';

/**
 * Debug component that displays image URL processing information
 */
const ImageDebugConsole: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  // Intercept console logs for image URLs
  useEffect(() => {
    const originalConsoleLog = console.log;
    
    // Override console.log to capture image processing logs
    console.log = (...args) => {
      originalConsoleLog(...args);
      
      // Only capture image URL related logs
      const logString = args.join(' ');
      if (
        logString.includes('image URL') || 
        logString.includes('Product for image') ||
        logString.includes('has images') ||
        logString.includes('Using')
      ) {
        setLog(prev => [...prev.slice(-19), logString]);
      }
    };
    
    // Restore original console.log on cleanup
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  if (!isVisible) {
    return (
      <Button 
        className="fixed bottom-4 left-4 z-50 bg-gray-800/90 hover:bg-gray-900"
        onClick={() => setIsVisible(true)}
      >
        Debug Images
      </Button>
    );
  }
  
  return (
    <Card className="fixed bottom-4 left-4 z-50 w-96 max-h-96 overflow-auto bg-gray-800 text-white border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          <span>Image Processing Debug</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs hover:bg-gray-700" 
            onClick={() => setIsVisible(false)}
          >
            Close
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="text-xs font-mono overflow-auto max-h-72">
          {log.length === 0 ? (
            <div className="text-gray-500">No image logs yet...</div>
          ) : (
            log.map((entry, i) => (
              <div key={i} className="py-1 border-t border-gray-700 first:border-0">
                {entry}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageDebugConsole; 