import { InMemoryEventBus } from '@fusioncommerce/event-bus';
import { buildApp } from './app.js';

describe('catalog service', () => {
  it('creates and lists products', async () => {
    const bus = new InMemoryEventBus();
    const app = buildApp({ eventBus: bus });
    const payload = {
      sku: 'sku-1',
      name: 'Test Product',
      description: 'A sample product',
      price: 20,
      currency: 'USD',
      inventory: 10
    };

    const createResponse = await app.inject({ method: 'POST', url: '/products', payload });
    expect(createResponse.statusCode).toBe(201);

    const listResponse = await app.inject({ method: 'GET', url: '/products' });
    const products = listResponse.json();
    expect(products).toHaveLength(1);
  });
});
