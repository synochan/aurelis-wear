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
  try {
    const response = await api.get('/orders/');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

const getOrderById = async (orderId: number): Promise<Order> => {
  try {
    const response = await api.get(`/orders/${orderId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order #${orderId}:`, error);
    throw error;
  }
};

export const orderService = {
  getOrders,
  getOrderById,
};

export default orderService; 