export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
}

export interface QueueInfo { name: string; state: string; messages: number; consumers: number; durable: boolean; }
export interface ExchangeInfo { name: string; type: string; durable: boolean; }
export interface BindingInfo { source: string; destination: string; destinationType: string; routingKey: string; }

export interface AuditLog { id: number; routingKey: string; payload: string; receivedAt: string; }
