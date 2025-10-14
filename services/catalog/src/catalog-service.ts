import { EventBus } from '@fusioncommerce/event-bus';
import { randomUUID } from 'crypto';
import { CatalogRepository } from './catalog-repository.js';
import { CreateProductRequest, Product } from './types.js';

export const PRODUCT_CREATED_TOPIC = 'product.created';

export class CatalogService {
  constructor(private readonly repository: CatalogRepository, private readonly eventBus: EventBus) {}

  async create(request: CreateProductRequest): Promise<Product> {
    const product: Product = {
      id: randomUUID(),
      sku: request.sku,
      name: request.name,
      description: request.description,
      price: request.price,
      currency: request.currency,
      inventory: request.inventory
    };
    await this.repository.create(product);
    await this.eventBus.publish(PRODUCT_CREATED_TOPIC, product);
    return product;
  }

  async list(): Promise<Product[]> {
    return this.repository.all();
  }
}
