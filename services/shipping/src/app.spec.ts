import { InMemoryEventBus } from '@fusioncommerce/event-bus';
import { buildApp } from './app.js';
import { ShippingRepository } from './shipping-repository.js';
import { ShippingLabel } from './types.js';

// Mock Repository
class MockShippingRepository implements ShippingRepository {
    private labels = new Map<string, ShippingLabel>();
    async save(label: ShippingLabel) { this.labels.set(label.id, label); return label; }
    async findById(id: string) { return this.labels.get(id) ?? null; }
    async findByOrderId(orderId: string) { return Array.from(this.labels.values()).filter(l => l.orderId === orderId); }
    async init() { }
}

describe('shipping service', () => {
    it('creates shipping label', async () => {
        const bus = new InMemoryEventBus();
        const repo = new MockShippingRepository();
        const app = buildApp({ eventBus: bus, repository: repo });

        const response = await app.inject({
            method: 'POST',
            url: '/shipping/labels',
            payload: {
                orderId: 'order-123',
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    country: 'US',
                    zip: '10001'
                }
            }
        });

        expect(response.statusCode).toBe(201);
        const label = response.json();
        expect(label.carrier).toBe('FedEx');
    });
});
