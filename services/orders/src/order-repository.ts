import { Knex } from '@fusioncommerce/database';
import { Order } from './types.js';

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  all(): Promise<Order[]>;
  init(): Promise<void>;
}

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async init(): Promise<void> { }

  async save(order: Order): Promise<Order> {
    this.orders.set(order.id, order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async all(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
}

export class PostgresOrderRepository implements OrderRepository {
  constructor(private readonly knex: Knex) { }

  async init(): Promise<void> {
    const exists = await this.knex.schema.hasTable('orders');
    if (!exists) {
      await this.knex.schema.createTable('orders', (table: Knex.CreateTableBuilder) => {
        table.string('id').primary();
        table.string('customer_id').notNullable();
        table.jsonb('items').notNullable();
        table.decimal('total', 10, 2).notNullable();
        table.string('currency').notNullable();
        table.string('status').notNullable();
        table.timestamp('created_at').defaultTo(this.knex.fn.now());
      });
    }
  }

  async save(order: Order): Promise<Order> {
    await this.knex('orders')
      .insert({
        id: order.id,
        customer_id: order.customerId,
        items: JSON.stringify(order.items),
        total: order.total,
        currency: order.currency,
        status: order.status,
        created_at: new Date(order.createdAt)
      })
      .onConflict('id')
      .merge();
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.knex('orders').where({ id }).first();
    if (!row) return null;
    return this.mapRowToOrder(row);
  }

  async all(): Promise<Order[]> {
    const rows = await this.knex('orders').select('*');
    return rows.map((row) => this.mapRowToOrder(row));
  }

  private mapRowToOrder(row: { id: string; customer_id: string; items: any; total: string; currency: string; status: any; created_at: Date }): Order {
    return {
      id: row.id,
      customerId: row.customer_id,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      total: Number(row.total),
      currency: row.currency,
      status: row.status,
      createdAt: row.created_at.toISOString()
    };
  }
}
