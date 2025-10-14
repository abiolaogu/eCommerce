import { InMemoryEventBus } from '@fusioncommerce/event-bus';
import {
  INVENTORY_FAILED_TOPIC,
  INVENTORY_RESERVED_TOPIC,
  ORDER_CREATED_TOPIC,
  OrderCreatedEvent
} from '@fusioncommerce/contracts';
import { buildApp } from './app.js';

describe('inventory service', () => {
  it('reserves inventory and emits success event', async () => {
    const bus = new InMemoryEventBus();
    const reserved: unknown[] = [];
    await bus.subscribe(INVENTORY_RESERVED_TOPIC, async (event) => {
      reserved.push(event.payload);
    });

    const app = buildApp({ eventBus: bus });
    await app.ready();

    await app.inject({
      method: 'PUT',
      url: '/inventory',
      payload: { sku: 'sku-1', quantity: 5 }
    });

    const orderEvent: OrderCreatedEvent = {
      orderId: 'order-1',
      customerId: 'customer',
      total: 100,
      items: [{ sku: 'sku-1', quantity: 2, price: 50 }]
    };
    await bus.publish(ORDER_CREATED_TOPIC, orderEvent);

    expect(reserved).toHaveLength(1);
  });

  it('emits failure event when stock insufficient', async () => {
    const bus = new InMemoryEventBus();
    const failures: unknown[] = [];
    await bus.subscribe(INVENTORY_FAILED_TOPIC, async (event) => {
      failures.push(event.payload);
    });

    const app = buildApp({ eventBus: bus });
    await app.ready();

    const orderEvent: OrderCreatedEvent = {
      orderId: 'order-2',
      customerId: 'customer',
      total: 100,
      items: [{ sku: 'sku-2', quantity: 1, price: 100 }]
    };
    await bus.publish(ORDER_CREATED_TOPIC, orderEvent);

    expect(failures).toHaveLength(1);
  });
});
