export const ORDER_CREATED_TOPIC = 'order.created';
export const INVENTORY_RESERVED_TOPIC = 'inventory.reserved';
export const INVENTORY_FAILED_TOPIC = 'inventory.insufficient';

export interface OrderCreatedEvent {
  orderId: string;
  customerId: string;
  total: number;
  items: Array<{ sku: string; quantity: number; price: number }>;
}

export interface InventoryStatusEvent {
  orderId: string;
  status: 'reserved' | 'insufficient';
  sku?: string;
  quantity?: number;
}
