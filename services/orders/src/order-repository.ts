import { Order } from './types.js';

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  all(): Promise<Order[]>;
}

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async save(order: Order): Promise<Order> {
    this.orders.set(order.id, order);
    return order;
  }

  async all(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
}
