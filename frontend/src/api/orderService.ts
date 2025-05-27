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
    // Make sure we're using the correct URL format
    const response = await api.get('/api/orders/');
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
    const response = await api.get(`/api/orders/${orderId}/`);
    console.log(`Order #${orderId} API response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching order #${orderId}:`, error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Add mock data for testing if needed
const mockOrders: Order[] = [
  {
    id: 1,
    status: 'delivered',
    payment_method: 'credit_card',
    payment_status: true,
    shipping_address: '123 Test St',
    shipping_price: 10,
    total_price: 100,
    created_at: '2023-05-15T14:30:00Z',
    updated_at: '2023-05-15T14:30:00Z',
    items: [
      {
        id: 1,
        product_name: 'Test Product',
        product: 1,
        color: {
          id: 1,
          name: 'Black',
          hex_value: '#000000',
        },
        size: {
          id: 1,
          name: 'M',
        },
        quantity: 1,
        price: 90,
      },
    ],
  },
];

export const orderService = {
  // Use real API endpoints first, fall back to mock data if they fail
  getOrders: async () => {
    try {
      // Try the real API first
      const realOrders = await getOrders();
      if (realOrders && realOrders.length > 0) {
        return realOrders;
      }
      // Fall back to mock data if no real orders
      console.log('No orders from API, using mock data');
      return mockOrders;
    } catch (error) {
      console.log('Error in orders, using mock data');
      return mockOrders;
    }
  },
  getOrderById: async (id: number) => {
    try {
      // Try the real API first
      return await getOrderById(id);
    } catch (error) {
      // Fall back to mock data
      console.log(`Error fetching order #${id}, using mock data`);
      return mockOrders[0];
    }
  },
};

export default orderService; 