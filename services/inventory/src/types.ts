export interface StockLevel {
  sku: string;
  quantity: number;
}

export interface InventoryReservation {
  orderId: string;
  sku: string;
  quantity: number;
  status: 'reserved' | 'insufficient';
}

export interface ConfigureStockRequest {
  sku: string;
  quantity: number;
}
