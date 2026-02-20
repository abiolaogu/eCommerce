import { Knex } from '@fusioncommerce/database';
import { Order } from './types.js';

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  all(options?: { limit: number; offset: number }): Promise<Order[]>;
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

  async all(options?: { limit: number; offset: number }): Promise<Order[]> {
    const limit = options?.limit ?? this.orders.size;
    const offset = options?.offset ?? 0;

    return Array.from(this.orders.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(offset, offset + limit);
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
        table.string('brand_id');
        table.string('destination_state');
        table.jsonb('items').notNullable();
        table.decimal('total', 10, 2).notNullable();
        table.string('currency').notNullable();
        table.string('status').notNullable();
        table.jsonb('orchestration');
        table.timestamp('created_at').defaultTo(this.knex.fn.now());
      });
    }

    await this.knex.raw('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC)');
    await this.knex.raw('CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders (customer_id)');
    await this.knex.raw('CREATE INDEX IF NOT EXISTS idx_orders_brand_destination ON orders (brand_id, destination_state)');
  }

  async save(order: Order): Promise<Order> {
    await this.knex('orders')
      .insert({
        id: order.id,
        customer_id: order.customerId,
        brand_id: order.brandId ?? null,
        destination_state: order.destinationState ?? null,
        items: JSON.stringify(order.items),
        total: order.total,
        currency: order.currency,
        status: order.status,
        orchestration: order.orchestration ? JSON.stringify(order.orchestration) : null,
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

  async all(options?: { limit: number; offset: number }): Promise<Order[]> {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const rows = await this.knex('orders')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
    return rows.map((row) => this.mapRowToOrder(row));
  }

  private mapRowToOrder(row: {
    id: string;
    customer_id: string;
    brand_id?: string | null;
    destination_state?: string | null;
    items: any;
    total: string;
    currency: string;
    status: any;
    orchestration?: any;
    created_at: Date;
  }): Order {
    return {
      id: row.id,
      customerId: row.customer_id,
      brandId: row.brand_id ?? undefined,
      destinationState: row.destination_state ?? undefined,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      total: Number(row.total),
      currency: row.currency,
      status: row.status,
      orchestration: row.orchestration
        ? typeof row.orchestration === 'string'
          ? JSON.parse(row.orchestration)
          : row.orchestration
        : undefined,
      createdAt: row.created_at.toISOString()
    };
  }
}
