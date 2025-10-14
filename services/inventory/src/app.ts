import Fastify, { FastifyInstance } from 'fastify';
import { EventBus } from '@fusioncommerce/event-bus';
import { ORDER_CREATED_TOPIC } from '@fusioncommerce/contracts';
import { InMemoryInventoryRepository, InventoryRepository } from './inventory-repository.js';
import { InventoryService } from './inventory-service.js';
import { ConfigureStockRequest } from './types.js';

export interface BuildInventoryAppOptions {
  eventBus: EventBus;
  repository?: InventoryRepository;
}

export function buildApp({ eventBus, repository }: BuildInventoryAppOptions): FastifyInstance {
  const app = Fastify({ logger: true });
  const repo = repository ?? new InMemoryInventoryRepository();
  const service = new InventoryService(repo, eventBus);

  app.addHook('onReady', async () => {
    await eventBus.subscribe(ORDER_CREATED_TOPIC, (event) => service.handleOrderCreated(event));
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.put<{ Body: ConfigureStockRequest }>('/inventory', {
    schema: {
      body: {
        type: 'object',
        required: ['sku', 'quantity'],
        properties: {
          sku: { type: 'string' },
          quantity: { type: 'integer', minimum: 0 }
        }
      }
    }
  }, async (request, reply) => {
    await service.configureStock(request.body);
    return reply.code(204).send();
  });

  app.get('/inventory', async () => service.listStock());

  return app;
}
