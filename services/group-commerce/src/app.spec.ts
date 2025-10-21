import { InMemoryEventBus } from '@fusioncommerce/event-bus';
import { buildApp } from './app.js';

describe('group commerce service', () => {
  it('creates and lists group commerce campaigns', async () => {
    const bus = new InMemoryEventBus();
    const app = buildApp({ eventBus: bus });
    const payload = {
      productId: 'product-1',
      minParticipants: 2,
      maxParticipants: 10,
      price: 10,
      originalPrice: 20,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    const createResponse = await app.inject({ method: 'POST', url: '/campaigns', payload });
    expect(createResponse.statusCode).toBe(201);

    const listResponse = await app.inject({ method: 'GET', url: '/campaigns' });
    const campaigns = listResponse.json();
    expect(campaigns).toHaveLength(1);
  });

  it('allows a user to join a campaign', async () => {
    const bus = new InMemoryEventBus();
    const app = buildApp({ eventBus: bus });
    const createPayload = {
      productId: 'product-1',
      minParticipants: 2,
      maxParticipants: 10,
      price: 10,
      originalPrice: 20,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    const createResponse = await app.inject({ method: 'POST', url: '/campaigns', payload: createPayload });
    const campaign = createResponse.json();

    const joinPayload = { userId: 'user-1' };
    const joinResponse = await app.inject({ method: 'POST', url: `/campaigns/${campaign.id}/join`, payload: joinPayload });
    expect(joinResponse.statusCode).toBe(200);

    const updatedCampaign = joinResponse.json();
    expect(updatedCampaign.actualParticipants).toBe(1);
  });
});