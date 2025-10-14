import { InMemoryEventBus } from '@fusioncommerce/event-bus';
import { ORDER_CREATED_TOPIC } from '@fusioncommerce/contracts';
import { buildApp } from './app.js';

describe('orders service', () => {
  it('creates orders and publishes events', async () => {
    const bus = new InMemoryEventBus();
    const events: unknown[] = [];
    await bus.subscribe(ORDER_CREATED_TOPIC, async (event) => {
      events.push(event.payload);
    });

    const app = buildApp({ eventBus: bus });
    const payload = {
      customerId: 'customer-123',
      items: [
        { sku: 'sku-1', quantity: 2, price: 10 },
        { sku: 'sku-2', quantity: 1, price: 5 }
      ]
    };
    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      payload
    });
    expect(response.statusCode).toBe(201);
    const order = response.json();
    expect(order.total).toBe(25);
    expect(events).toHaveLength(1);
  });
});
