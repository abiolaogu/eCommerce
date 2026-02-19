import { EventBus } from '@fusioncommerce/event-bus';
import { SHIPPING_LABEL_CREATED_TOPIC, ShippingLabelCreatedEvent } from '@fusioncommerce/contracts';
import {
    CoverageLaneResponse,
    mapFusionOrderToPolicyRequest,
    normalizeFusionPolicyLines,
    OmniRouteClient
} from '@fusioncommerce/omniroute-sdk';
import { randomUUID } from 'crypto';
import { ShippingRepository } from './shipping-repository.js';
import { CreateShippingLabelRequest, ShippingLabel } from './types.js';

export class ShippingService {
    constructor(
        private readonly repository: ShippingRepository,
        private readonly eventBus: EventBus,
        private readonly omnirouteClient?: OmniRouteClient
    ) { }

    async previewLanes(destinationState: string): Promise<CoverageLaneResponse[]> {
        if (!this.omnirouteClient) {
            throw new Error('OmniRoute client not configured');
        }

        return this.omnirouteClient.listCoverageLanes(destinationState);
    }

    async createLabel(request: CreateShippingLabelRequest): Promise<ShippingLabel> {
        // Real integration with a shipping provider (e.g. Shippo/EasyPost)
        // For this demo, we simulate a real HTTP call to a carrier API
        let selectedLane: CoverageLaneResponse | undefined;
        let policyCompliant: boolean | undefined;

        if (this.omnirouteClient && request.destinationState) {
            const lanes = await this.omnirouteClient.listCoverageLanes(request.destinationState);
            selectedLane = lanes[0];
        }

        if (this.omnirouteClient && request.brandId && request.destinationState && request.items?.length) {
            const policy = await this.omnirouteClient.evaluateCheckoutPolicy(
                mapFusionOrderToPolicyRequest({
                    brandId: request.brandId,
                    destinationState: request.destinationState,
                    items: normalizeFusionPolicyLines(request.items)
                })
            );
            policyCompliant = policy.compliant;
            if (!selectedLane && policy.coverageLane) {
                selectedLane = {
                    laneId: `policy-${request.orderId}`,
                    owner: policy.coverageLane,
                    ownerType: 'policy_lane',
                    slaHours: policy.expectedSlaHours
                };
            }
        }

        const carrier = selectedLane?.ownerType === 'logistics_aggregator'
            ? 'Aggregator Network'
            : 'FedEx';

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
            orchestration: selectedLane
                ? {
                    coverageLane: selectedLane.owner,
                    ownerType: selectedLane.ownerType,
                    expectedSlaHours: selectedLane.slaHours,
                    policyCompliant
                }
                : undefined,
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
