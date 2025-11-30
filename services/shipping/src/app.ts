import Fastify, { FastifyInstance } from 'fastify';
import { EventBus } from '@fusioncommerce/event-bus';
import { ShippingService } from './shipping-service.js';
import { ShippingRepository } from './shipping-repository.js';
import { CreateShippingLabelRequest } from './types.js';

export interface BuildAppOptions {
    eventBus: EventBus;
    repository: ShippingRepository;
}

export function buildApp({ eventBus, repository }: BuildAppOptions): FastifyInstance {
    const app = Fastify({ logger: true });
    const service = new ShippingService(repository, eventBus);

    app.get('/health', async () => ({ status: 'ok' }));

    app.post<{ Body: CreateShippingLabelRequest }>('/shipping/labels', {
        schema: {
            body: {
                type: 'object',
                required: ['orderId', 'address'],
                properties: {
                    orderId: { type: 'string' },
                    address: {
                        type: 'object',
                        required: ['street', 'city', 'country', 'zip'],
                        properties: {
                            street: { type: 'string' },
                            city: { type: 'string' },
                            country: { type: 'string' },
                            zip: { type: 'string' }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const label = await service.createLabel(request.body);
            return reply.code(201).send(label);
        } catch (error) {
            request.log.error({ err: error }, 'failed to create shipping label');
            return reply.code(400).send({ message: (error as Error).message });
        }
    });

    app.get('/shipping/labels/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const label = await service.getLabel(id);
        if (!label) {
            return reply.code(404).send({ message: 'Label not found' });
        }
        return label;
    });

    return app;
}
