export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'starter' | 'main' | 'pizza' | 'drinks' | 'dessert';
  image: string;
  popular?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Booking {
  date: string;
  time: string;
  guests: number;
  type: 'indoor' | 'outdoor';
  notes: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
  customerName: string;
  customerPhone: string;
  address: string;
  timestamp: number;
}

export enum ViewState {
  HOME = 'HOME',
  MENU = 'MENU',
  BOOKING = 'BOOKING',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  TRACKING = 'TRACKING',
  ADMIN = 'ADMIN'
}
