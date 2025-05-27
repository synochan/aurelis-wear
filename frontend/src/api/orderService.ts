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

const getOrders = async (): Promise<Order[]> => {
  console.log('Fetching orders...');
  try {
    // Don't add /api/ prefix - it's already added by the API client
    const response = await api.get('/orders/');
    console.log('Orders API response:', response.data);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.warn('Orders API returned non-array data:', response.data);
      return [];
    }
    
    return response.data;
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