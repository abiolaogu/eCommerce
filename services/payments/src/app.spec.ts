import { InMemoryEventBus } from '@fusioncommerce/event-bus';
import { buildApp } from './app.js';

import { Payment } from './types.js';

jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        paymentIntents: {
            create: jest.fn().mockResolvedValue({
                status: 'succeeded',
                id: 'pi_mock'
            })
        }
    }));
});

// Mock InMemory Repository for testing
class MockPaymentRepository {
    private payments = new Map<string, Payment>();
    async save(payment: Payment) { this.payments.set(payment.id, payment); return payment; }
    async findById(id: string) { return this.payments.get(id) ?? null; }
    async findByOrderId(orderId: string) { return Array.from(this.payments.values()).filter(p => p.orderId === orderId); }
    async init() { }
}

describe('payments service', () => {
    it('processes payment', async () => {
        const bus = new InMemoryEventBus();
        const repo = new MockPaymentRepository();
        const app = buildApp({ eventBus: bus, repository: repo as any });

        const response = await app.inject({
            method: 'POST',
            url: '/payments',
            payload: {
                orderId: 'order-123',
                amount: 100,
                currency: 'USD',
                paymentMethodId: 'pm-123'
            }
        });

        expect(response.statusCode).toBe(201);
        const payment = response.json();
        expect(payment.status).toBe('succeeded'); // Mock logic succeeds
    });
});
