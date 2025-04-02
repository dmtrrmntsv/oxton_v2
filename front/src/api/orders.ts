import axios from 'axios';
import { API_BASE_URL } from './config';

export interface OrderData {
  amount: number;
  price: number;
  is_buy: boolean;
  baseToken: string;
  quoteToken: string;
  user_wallet: string;
  timestamp: number;
  fee: number;
  is_paired: boolean;
}

export const createOrder = async (orderData: OrderData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};