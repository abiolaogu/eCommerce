import { EventBus } from '@fusioncommerce/event-bus';
import { ORDER_CREATED_TOPIC, OrderCreatedEvent } from '@fusioncommerce/contracts';
import { randomUUID } from 'crypto';
import { OrderRepository } from './order-repository.js';
import { CreateOrderRequest, Order } from './types.js';

export class OrderService {
  constructor(private readonly repository: OrderRepository, private readonly eventBus: EventBus) { }

  async create(request: CreateOrderRequest): Promise<Order> {
    if (!request.customerId || request.items.length === 0) {
      throw new Error('Invalid order request');
    }
    const total = request.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order: Order = {
      id: randomUUID(),
      customerId: request.customerId,
      items: request.items.map((item) => ({ ...item })),
      total,
      currency: request.currency || 'USD',
      status: 'created',
      createdAt: new Date().toISOString()
    };
    await this.repository.save(order);
    const event: OrderCreatedEvent = {
      orderId: order.id,
      customerId: order.customerId,
      total: order.total,
      items: order.items
    };
    await this.eventBus.publish(ORDER_CREATED_TOPIC, event);
    return order;
  }

  async list(): Promise<Order[]> {
    return this.repository.all();
  }
}
