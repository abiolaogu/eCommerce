import { Product } from './types.js';

export interface CatalogRepository {
  create(product: Product): Promise<Product>;
  all(options?: { limit: number; offset: number }): Promise<Product[]>;
}

export class InMemoryCatalogRepository implements CatalogRepository {
  private readonly products = new Map<string, Product>();

  async create(product: Product): Promise<Product> {
    this.products.set(product.id, product);
    return product;
  }

  async all(options?: { limit: number; offset: number }): Promise<Product[]> {
    const limit = options?.limit ?? this.products.size;
    const offset = options?.offset ?? 0;

    return Array.from(this.products.values()).slice(offset, offset + limit);
  }
}
