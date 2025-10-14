import { InventoryReservation, StockLevel } from './types.js';

export interface InventoryRepository {
  setStock(level: StockLevel): Promise<void>;
  getStock(sku: string): Promise<StockLevel | undefined>;
  reserve(orderId: string, sku: string, quantity: number): Promise<InventoryReservation>;
  all(): Promise<StockLevel[]>;
}

export class InMemoryInventoryRepository implements InventoryRepository {
  private readonly stock = new Map<string, number>();

  async setStock(level: StockLevel): Promise<void> {
    this.stock.set(level.sku, level.quantity);
  }

  async getStock(sku: string): Promise<StockLevel | undefined> {
    const quantity = this.stock.get(sku);
    if (quantity === undefined) return undefined;
    return { sku, quantity };
  }

  async reserve(orderId: string, sku: string, quantity: number): Promise<InventoryReservation> {
    const available = this.stock.get(sku) ?? 0;
    if (available < quantity) {
      return { orderId, sku, quantity, status: 'insufficient' };
    }
    this.stock.set(sku, available - quantity);
    return { orderId, sku, quantity, status: 'reserved' };
  }

  async all(): Promise<StockLevel[]> {
    return Array.from(this.stock.entries()).map(([sku, quantity]) => ({ sku, quantity }));
  }
}
