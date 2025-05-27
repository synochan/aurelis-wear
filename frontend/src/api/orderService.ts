import api from './config';

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

const getOrders = async (): Promise<Order[]> => {
  console.log('Fetching orders...');
  try {
    // Don't add /api/ prefix - it's already added by the API client
    const response = await api.get('/orders/');
    console.log('Orders API response:', response.data);
    
    // Handle paginated response
    if (response.data && response.data.results && Array.isArray(response.data.results)) {
      console.log(`Found ${response.data.results.length} orders in paginated response`);
      return response.data.results;
    } 
    
    // Handle direct array response (fallback)
    if (Array.isArray(response.data)) {
      console.log(`Found ${response.data.length} orders in array response`);
      return response.data;
    }
    
    console.warn('Orders API returned unexpected data format:', response.data);
    return [];
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    console.error('Error details:', error.response?.data || error.message);
    // Return empty array instead of throwing
    return [];
  }
};

const getOrderById = async (orderId: number): Promise<Order> => {
  console.log(`Fetching order #${orderId}...`);
  try {
    // Don't add /api/ prefix - it's already added by the API client
    const response = await api.get(`/orders/${orderId}/`);
    console.log(`Order #${orderId} API response:`, response.data);
    return response.data;
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