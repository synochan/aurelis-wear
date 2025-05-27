import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/api/client';
import { getImageUrl } from '@/utils/imageUtils';

interface TestCase {
  id: string;
  description: string;
  originalUrl: string;
  processedUrl: string;
  status: 'loading' | 'success' | 'error';
}

/**
 * Component to directly test various image URL formats with Cloudinary
 */
const DirectImageTest: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: '1',
      description: 'Full Cloudinary URL',
      originalUrl: 'https://res.cloudinary.com/dr5mrez5h/image/upload/v1748245890/products/ksgv9czlzpsayg2sodcm.jpg',
      processedUrl: '',
      status: 'loading'
    },
    {
      id: '2',
      description: 'Duplicate image/upload URL',
      originalUrl: 'https://res.cloudinary.com/dr5mrez5h/image/upload/image/upload/v1748245890/products/ksgv9czlzpsayg2sodcm.jpg',
      processedUrl: '',
      status: 'loading'
    },
    {
      id: '3',
      description: 'Partial Cloudinary URL',
      originalUrl: 'image/upload/v1748245890/products/ksgv9czlzpsayg2sodcm.jpg',
      processedUrl: '',
      status: 'loading'
    },
    {
      id: '4',
      description: 'Just product path',
      originalUrl: 'products/ksgv9czlzpsayg2sodcm.jpg',
      processedUrl: '',
      status: 'loading'
    },
    {
      id: '5',
      description: 'Just filename',
      originalUrl: 'ksgv9czlzpsayg2sodcm.jpg',
      processedUrl: '',
      status: 'loading'
    },
  ]);
  
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Process test cases
  useEffect(() => {
    const processed = testCases.map(test => ({
      ...test,
      processedUrl: getImageUrl(test.originalUrl),
      status: 'loading' as 'loading' | 'success' | 'error'
    }));
    
    setTestCases(processed);
  }, []);
  
  // Fetch some real products to test with
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('/products', { params: { limit: 3 } });
        const products = response.data.results || response.data;
        setRealProducts(products.slice(0, 3));
      } catch (error) {
        console.error('Error fetching products for image test:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Handle image load success
  const handleImageLoad = (id: string) => {
    setTestCases(prev => 
      prev.map(test => 
        test.id === id 
          ? { ...test, status: 'success' } 
          : test
      )
    );
  };
  
  // Handle image load error
  const handleImageError = (id: string) => {
    setTestCases(prev => 
      prev.map(test => 
        test.id === id 
          ? { ...test, status: 'error' } 
          : test
      )
    );
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Direct Image URL Testing</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Test URL Formats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testCases.map(test => (
            <Card key={test.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex justify-between items-center">
                  <span>Test {test.id}: {test.description}</span>
                  <Badge
                    className={
                      test.status === 'loading' ? 'bg-gray-500' :
                      test.status === 'success' ? 'bg-green-500' :
                      'bg-red-500'
                    }
                  >
                    {test.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs truncate">
                  {test.originalUrl}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2">
                  <img
                    src={test.processedUrl}
                    alt={`Test ${test.id}`}
                    className="w-full h-full object-cover"
                    onLoad={() => handleImageLoad(test.id)}
                    onError={() => handleImageError(test.id)}
                  />
                </div>
                <div className="text-xs text-gray-500 overflow-hidden text-ellipsis">
                  Processed: {test.processedUrl}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-3">Real Products from API</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {realProducts.map((product, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{product.name}</CardTitle>
                  <CardDescription className="text-xs">
                    Product ID: {product.id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-gray-500 overflow-hidden text-ellipsis">
                    Raw URL: {product.image}
                  </div>
                  <div className="text-xs text-gray-500 overflow-hidden text-ellipsis mt-1">
                    Processed: {getImageUrl(product.image)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectImageTest; 