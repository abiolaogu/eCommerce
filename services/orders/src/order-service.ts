import { EventBus } from '@fusioncommerce/event-bus';
import { ORDER_CREATED_TOPIC, OrderCreatedEvent } from '@fusioncommerce/contracts';
import {
  mapFusionOrderToPolicyRequest,
  normalizeFusionPolicyLines,
  OmniRouteClient,
  PolicyCheckResponse,
} from '@fusioncommerce/omniroute-sdk';
import { randomUUID } from 'crypto';
import { OrderRepository } from './order-repository.js';
import { CreateOrderRequest, Order, PolicyPreviewRequest } from './types.js';

export class OrderService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly eventBus: EventBus,
    private readonly omnirouteClient?: OmniRouteClient
  ) { }

  async previewPolicy(request: PolicyPreviewRequest): Promise<PolicyCheckResponse> {
    if (!this.omnirouteClient) {
      throw new Error('OmniRoute client not configured');
    }

    return this.omnirouteClient.evaluateCheckoutPolicy(
      mapFusionOrderToPolicyRequest({
        brandId: request.brandId,
        destinationState: request.destinationState,
        items: normalizeFusionPolicyLines(request.items),
      })
    );
  }

  async create(request: CreateOrderRequest): Promise<Order> {
    if (!request.customerId || request.items.length === 0) {
      throw new Error('Invalid order request');
    }

    let orchestration: PolicyCheckResponse | undefined;
    if (this.omnirouteClient && request.brandId && request.destinationState) {
      orchestration = await this.omnirouteClient.evaluateCheckoutPolicy(
        mapFusionOrderToPolicyRequest({
          brandId: request.brandId,
          destinationState: request.destinationState,
          items: normalizeFusionPolicyLines(request.items),
        })
      );
    }

    const total = request.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order: Order = {
      id: randomUUID(),
      customerId: request.customerId,
      items: request.items.map((item) => ({ ...item })),
      total,
      currency: request.currency || 'USD',
      status: 'created',
      brandId: request.brandId,
      destinationState: request.destinationState,
      orchestration: orchestration
        ? {
          compliant: orchestration.compliant,
          coverageLane: orchestration.coverageLane,
          expectedSlaHours: orchestration.expectedSlaHours,
          checks: orchestration.checks,
          automationNotes: orchestration.automationNotes,
        }
        : undefined,
      createdAt: new Date().toISOString()
    };
    await this.repository.save(order);
    const event: OrderCreatedEvent = {
      orderId: order.id,
      customerId: order.customerId,
      total: order.total,
      items: order.items
    };
    await this.eventBus.publish(ORDER_CREATED_TOPIC, event);
    return order;
  }

  async list(): Promise<Order[]> {
    return this.repository.all();
  }
}
