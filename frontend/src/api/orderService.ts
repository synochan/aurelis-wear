import api from './config';
import { authService } from './authService';
import { getImageUrl } from '@/utils/imageUtils';

// Define types
export interface OrderItem {
  id: number;
  product_name: string;
  product: number;
  color: {
    id: number;
    name: string;
    hex_value: string;
  };
  size: {
    id: number;
    name: string;
  };
  quantity: number;
  price: number | string;
  image?: string;
  product_image?: string;
}

export interface Order {
  id: number;
  status: string;
  payment_method: string;
  payment_status: boolean;
  shipping_address: string;
  shipping_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

// Define the paginated response type
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Process order data to ensure all fields are properly formatted
 * @param order The order to process
 * @returns The processed order with proper image URLs
 */
const processOrder = (order: Order): Order => {
  // Process item images if available
  if (order.items && Array.isArray(order.items)) {
    order.items = order.items.map(item => ({
      ...item,
      image: item.image ? getImageUrl(item.image) : item.product_image ? getImageUrl(item.product_image) : undefined
    }));
  }
  
  return order;
};

/**
 * Fetches all orders for the current user, handling pagination if needed
 */
const getOrders = async (): Promise<Order[]> => {
  console.log('Fetching orders for current user...');
  
  // Make sure we're authenticated
  if (!authService.isAuthenticated()) {
    console.warn('Not authenticated, cannot fetch orders');
    return [];
  }
  
  try {
    // Fetch all pages of orders
    let allOrders: Order[] = [];
    let nextPageUrl: string | null = '/orders/'; // Initial URL
    
    // Keep fetching pages until there are no more
    while (nextPageUrl) {
      console.log(`Fetching orders page: ${nextPageUrl}`);
      
      // Make the API request
      const response = await api.get(nextPageUrl);
      console.log('Orders API response:', response.data);
      
      // Handle paginated response
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        // Process and add this page's results to our collection
        const processedOrders = response.data.results.map(processOrder);
        allOrders = [...allOrders, ...processedOrders];
        console.log(`Added ${processedOrders.length} orders from page`);
        
        // Set up next page URL if available
        nextPageUrl = response.data.next;
        
        // If the next URL is a full URL, extract just the path
        if (nextPageUrl && (nextPageUrl.startsWith('http://') || nextPageUrl.startsWith('https://'))) {
          try {
            const url = new URL(nextPageUrl);
            nextPageUrl = url.pathname + url.search;
          } catch (e) {
            console.error('Error parsing next page URL:', e);
            nextPageUrl = null;
          }
        }
      } else if (Array.isArray(response.data)) {
        // Handle direct array response (fallback)
        const processedOrders = response.data.map(processOrder);
        allOrders = [...allOrders, ...processedOrders];
        console.log(`Added ${processedOrders.length} orders from non-paginated response`);
        nextPageUrl = null; // No more pages
      } else {
        console.warn('Orders API returned unexpected data format:', response.data);
        nextPageUrl = null; // Stop trying
      }
    }
    
    console.log(`Total orders fetched: ${allOrders.length}`);
    return allOrders;
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    console.error('Error details:', error.response?.data || error.message);
    // Return empty array instead of throwing
    return [];
  }
};

const getOrderById = async (orderId: number): Promise<Order> => {
  console.log(`Fetching order #${orderId}...`);
  
  // Make sure we're authenticated
  if (!authService.isAuthenticated()) {
    throw new Error('Not authenticated, cannot fetch order details');
  }
  
  try {
    // Don't add /api/ prefix - it's already added by the API client
    const response = await api.get(`/orders/${orderId}/`);
    console.log(`Order #${orderId} API response:`, response.data);
    
    // Process the order data before returning
    return processOrder(response.data);
  } catch (error: any) {
    console.error(`Error fetching order #${orderId}:`, error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

export const orderService = {
  getOrders,
  getOrderById,
};

export default orderService; 