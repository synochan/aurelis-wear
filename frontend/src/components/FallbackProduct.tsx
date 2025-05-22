import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface FallbackProductProps {
  message?: string;
  isLoading?: boolean;
}

const FallbackProduct = ({ 
  message = "Product not available", 
  isLoading = false 
}: FallbackProductProps) => {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="relative aspect-square">
          <Skeleton className="h-full w-full" />
        </div>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gray-50 border-dashed">
      <div className="relative aspect-square flex items-center justify-center bg-gray-100">
        <AlertCircle className="h-12 w-12 text-gray-400" />
      </div>
      <CardContent className="p-4 text-center">
        <p className="text-gray-500">{message}</p>
      </CardContent>
    </Card>
  );
};

export default FallbackProduct; 