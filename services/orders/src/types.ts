export interface OrderItem {
  sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'created' | 'confirmed' | 'failed';
  createdAt: string;
}

export interface CreateOrderRequest {
  customerId: string;
  items: Array<{
    sku: string;
    quantity: number;
    price: number;
  }>;
}
