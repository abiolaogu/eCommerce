import { Knex } from '@fusioncommerce/database';
import { InventoryReservation, StockLevel } from './types.js';

export interface InventoryRepository {
  setStock(level: StockLevel): Promise<void>;
  getStock(sku: string): Promise<StockLevel | undefined>;
  reserve(orderId: string, sku: string, quantity: number): Promise<InventoryReservation>;
  all(): Promise<StockLevel[]>;
  init(): Promise<void>;
}

export class InMemoryInventoryRepository implements InventoryRepository {
  private readonly stock = new Map<string, number>();

  async init(): Promise<void> { }

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

export class PostgresInventoryRepository implements InventoryRepository {
  constructor(private readonly knex: Knex) { }

  async init(): Promise<void> {
    const exists = await this.knex.schema.hasTable('inventory');
    if (!exists) {
      await this.knex.schema.createTable('inventory', (table: Knex.CreateTableBuilder) => {
        table.string('sku').primary();
        table.integer('quantity').notNullable();
      });
    }
  }

  async setStock(level: StockLevel): Promise<void> {
    await this.knex('inventory')
      .insert({
        sku: level.sku,
        quantity: level.quantity
      })
      .onConflict('sku')
      .merge();
  }

  async getStock(sku: string): Promise<StockLevel | undefined> {
    const row = await this.knex('inventory').where({ sku }).first();
    if (!row) return undefined;
    return { sku: row.sku, quantity: row.quantity };
  }

  async reserve(orderId: string, sku: string, quantity: number): Promise<InventoryReservation> {
    // Optimistic locking via SQL condition
    const count = await this.knex('inventory')
      .where({ sku })
      .andWhere('quantity', '>=', quantity)
      .decrement('quantity', quantity);

    if (count) {
      return { orderId, sku, quantity, status: 'reserved' };
    }
    return { orderId, sku, quantity, status: 'insufficient' };
  }

  async all(): Promise<StockLevel[]> {
    const rows = await this.knex('inventory').select('*');
    return rows.map((row: { sku: string; quantity: number }) => ({ sku: row.sku, quantity: row.quantity }));
  }
}
