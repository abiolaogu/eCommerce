import { EventBus } from '@fusioncommerce/event-bus';
import { SHIPPING_LABEL_CREATED_TOPIC, ShippingLabelCreatedEvent } from '@fusioncommerce/contracts';
import { randomUUID } from 'crypto';
import { ShippingRepository } from './shipping-repository.js';
import { CreateShippingLabelRequest, ShippingLabel } from './types.js';

export class ShippingService {
    constructor(private readonly repository: ShippingRepository, private readonly eventBus: EventBus) { }

    async createLabel(request: CreateShippingLabelRequest): Promise<ShippingLabel> {
        // Real integration with a shipping provider (e.g. Shippo/EasyPost)
        // For this demo, we simulate a real HTTP call to a carrier API
        const carrier = 'FedEx';

        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate API response
        const trackingNumber = `TRK-${randomUUID().substring(0, 8).toUpperCase()}`;
        const labelUrl = `https://api.carrier.com/labels/${trackingNumber}.pdf`;

        const label: ShippingLabel = {
            id: randomUUID(),
            orderId: request.orderId,
            trackingNumber,
            carrier,
            labelUrl,
            createdAt: new Date().toISOString()
        };

        await this.repository.save(label);

        await this.eventBus.publish<ShippingLabelCreatedEvent>(SHIPPING_LABEL_CREATED_TOPIC, {
            orderId: label.orderId,
            trackingNumber: label.trackingNumber,
            carrier: label.carrier,
            labelUrl: label.labelUrl
        });

        return label;
    }

    async getLabel(id: string): Promise<ShippingLabel | null> {
        return this.repository.findById(id);
    }
}
