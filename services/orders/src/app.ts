import Fastify, { FastifyInstance } from 'fastify';
import { EventBus } from '@fusioncommerce/event-bus';
import { InMemoryOrderRepository, OrderRepository } from './order-repository.js';
import { OrderService } from './order-service.js';
import { CreateOrderRequest } from './types.js';

export interface BuildAppOptions {
  eventBus: EventBus;
  repository?: OrderRepository;
}

export function buildApp({ eventBus, repository }: BuildAppOptions): FastifyInstance {
  const app = Fastify({ logger: true });
  const repo = repository ?? new InMemoryOrderRepository();
  const service = new OrderService(repo, eventBus);

  app.get('/health', async () => ({ status: 'ok' }));

  app.post<{ Body: CreateOrderRequest }>('/orders', {
    schema: {
      body: {
        type: 'object',
        required: ['customerId', 'items'],
        properties: {
          customerId: { type: 'string' },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['sku', 'quantity', 'price'],
              properties: {
                sku: { type: 'string' },
                quantity: { type: 'integer', minimum: 1 },
                price: { type: 'number', minimum: 0 }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const order = await service.create(request.body);
      return reply.code(201).send(order);
    } catch (error) {
      request.log.error({ err: error }, 'failed to create order');
      return reply.code(400).send({ message: (error as Error).message });
    }
  });

  app.get('/orders', async () => service.list());

  return app;
}
