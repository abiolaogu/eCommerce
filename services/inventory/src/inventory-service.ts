import { EventBus, EventEnvelope } from '@fusioncommerce/event-bus';
import {
  INVENTORY_FAILED_TOPIC,
  INVENTORY_RESERVED_TOPIC,
  InventoryStatusEvent,
  OrderCreatedEvent
} from '@fusioncommerce/contracts';
import { InventoryRepository } from './inventory-repository.js';
import { InventoryReservation, StockLevel } from './types.js';

export class InventoryService {
  constructor(private readonly repository: InventoryRepository, private readonly eventBus: EventBus) {}

  async configureStock(level: StockLevel): Promise<void> {
    await this.repository.setStock(level);
  }

  async listStock(): Promise<StockLevel[]> {
    return this.repository.all();
  }

  async handleOrderCreated(event: EventEnvelope<OrderCreatedEvent>): Promise<void> {
    const results: InventoryReservation[] = [];
    for (const item of event.payload.items) {
      const reservation = await this.repository.reserve(event.payload.orderId, item.sku, item.quantity);
      results.push(reservation);
    }
    const failed = results.find((result) => result.status === 'insufficient');
    if (failed) {
      const failureEvent: InventoryStatusEvent = {
        orderId: failed.orderId,
        status: 'insufficient',
        sku: failed.sku,
        quantity: failed.quantity
      };
      await this.eventBus.publish(INVENTORY_FAILED_TOPIC, failureEvent);
    } else {
      const successEvent: InventoryStatusEvent = {
        orderId: event.payload.orderId,
        status: 'reserved'
      };
      await this.eventBus.publish(INVENTORY_RESERVED_TOPIC, successEvent);
    }
  }
}
