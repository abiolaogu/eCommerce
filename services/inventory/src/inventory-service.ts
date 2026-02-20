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
    const quantitiesBySku = event.payload.items.reduce((accumulator, item) => {
      accumulator.set(item.sku, (accumulator.get(item.sku) ?? 0) + item.quantity);
      return accumulator;
    }, new Map<string, number>());

    const results: InventoryReservation[] = await Promise.all(
      Array.from(quantitiesBySku.entries()).map(([sku, quantity]) =>
        this.repository.reserve(event.payload.orderId, sku, quantity)
      )
    );

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
