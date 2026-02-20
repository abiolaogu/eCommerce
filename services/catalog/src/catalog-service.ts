import { EventBus } from '@fusioncommerce/event-bus';
import { randomUUID } from 'crypto';
import { CatalogRepository } from './catalog-repository.js';
import { CreateProductRequest, ListProductsQuery, Product } from './types.js';

export const PRODUCT_CREATED_TOPIC = 'product.created';
const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 200;

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

  async list(query: ListProductsQuery = {}): Promise<Product[]> {
    const limit = Math.min(MAX_LIST_LIMIT, Math.max(1, Math.floor(query.limit ?? DEFAULT_LIST_LIMIT)));
    const offset = Math.max(0, Math.floor(query.offset ?? 0));
    return this.repository.all({ limit, offset });
  }
}
