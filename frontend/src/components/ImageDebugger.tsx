import React, { useState, useEffect } from 'react';
import { getImageUrl, getBestProductImage } from '@/utils/imageUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productService } from '@/api/productService';
import { Product } from '@/components/ProductCard';
import { Separator } from '@/components/ui/separator';

/**
 * A component for debugging image URL processing
 * Use this component to test how the getImageUrl function processes different image URLs
 */
const ImageDebugger: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [processedUrl, setProcessedUrl] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch some products for testing
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getProducts({ limit: '5' });
        setProducts(data.slice(0, 5)); // Just take the first 5 for simplicity
      } catch (error) {
        setErrorMessage('Failed to fetch test products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const processUrl = () => {
    try {
      if (!inputUrl.trim()) {
        setErrorMessage('Please enter an image URL');
        setShowImage(false);
        return;
      }

      const processed = getImageUrl(inputUrl);
      setProcessedUrl(processed);
      setShowImage(true);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(`Error processing URL: ${error}`);
      setShowImage(false);
    }
  };

  const clearAll = () => {
    setInputUrl('');
    setProcessedUrl('');
    setShowImage(false);
    setErrorMessage('');
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    const bestImage = getBestProductImage(product);
    setProcessedUrl(bestImage);
    setShowImage(true);
  };

  // Sample test cases for quick testing
  const testCases = [
    'products/sample.jpg',
    'v1234567890/products/sample.jpg',
    'image/upload/v1234567890/products/sample.jpg',
    'https://res.cloudinary.com/dr5mrez5h/image/upload/v1234567890/products/sample.jpg',
    '/media/products/sample.jpg',
    'sample.jpg',
    '',
    'null',
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Image URL Debugger</CardTitle>
        <CardDescription>
          Test how image URLs are processed by the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual">
          <TabsList>
            <TabsTrigger value="manual">Manual URL Test</TabsTrigger>
            <TabsTrigger value="products">Product Images Test</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                Image URL
              </label>
              <Input
                id="imageUrl"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter an image URL to process"
                className="w-full"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={processUrl}>Process URL</Button>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>

            <CardFooter className="flex-col items-start p-0">
              <p className="text-sm font-medium mb-2">Test with sample URLs:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                {testCases.map((testCase, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="justify-start h-auto py-1 px-2 text-xs"
                    onClick={() => {
                      setInputUrl(testCase);
                      setProcessedUrl('');
                      setShowImage(false);
                    }}
                  >
                    {testCase || '(empty string)'}
                  </Button>
                ))}
              </div>
            </CardFooter>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-4 mt-4">
            <div className="text-sm text-gray-500 mb-4">
              This tab shows real products from your API to help debug image loading.
            </div>
            
            {isLoading && <div>Loading products...</div>}
            
            {products.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Select a product to test:</div>
                
                <div className="grid grid-cols-1 gap-2">
                  {products.map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      className="justify-start h-auto py-2 text-left"
                      onClick={() => selectProduct(product)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                          <img 
                            src={getImageUrl(product.image)} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/product-placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="truncate">
                          {product.name}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {selectedProduct && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                <p className="font-medium">Selected Product:</p>
                <p className="mb-2">{selectedProduct.name} (ID: {selectedProduct.id})</p>
                
                <Separator className="my-2" />
                
                <p className="font-medium">Image Properties:</p>
                <p className="whitespace-pre-wrap break-all text-xs">
                  <strong>image:</strong> {selectedProduct.image || 'N/A'}<br />
                  <strong>images array:</strong> {selectedProduct.images ? 
                    `(${selectedProduct.images.length} items)` : 
                    'None'
                  }
                </p>
                
                {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-xs">Available Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                      {selectedProduct.images.map((img, index) => {
                        const imgUrl = typeof img === 'string' 
                          ? img 
                          : img && 'image' in img ? img.image : '';
                        return (
                          <div key={index} className="text-xs">
                            <div className="w-full aspect-square bg-gray-100 mb-1">
                              <img 
                                src={getImageUrl(imgUrl)} 
                                alt="" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/product-placeholder.svg';
                                }}
                              />
                            </div>
                            <p className="truncate">{
                              typeof img === 'object' && 'is_primary' in img && img.is_primary 
                                ? '✅ Primary' 
                                : `Image ${index + 1}`
                            }</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {errorMessage && (
          <div className="bg-red-50 p-3 rounded text-red-500 text-sm mt-4">
            {errorMessage}
          </div>
        )}
        
        {processedUrl && (
          <div className="bg-gray-50 p-3 rounded mt-4">
            <p className="text-sm font-medium">Processed URL:</p>
            <p className="text-xs break-all mt-1">{processedUrl}</p>
          </div>
        )}
        
        {showImage && (
          <div className="border rounded p-4 mt-4">
            <p className="text-sm font-medium mb-2">Image Preview:</p>
            <div className="aspect-square w-full max-w-xs mx-auto bg-gray-100 relative">
              <img
                src={processedUrl}
                alt="Processed image"
                className="w-full h-full object-contain"
                onError={() => {
                  setErrorMessage('Failed to load image with the processed URL');
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageDebugger; 