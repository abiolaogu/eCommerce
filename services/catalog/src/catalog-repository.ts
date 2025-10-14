import { Product } from './types.js';

export interface CatalogRepository {
  create(product: Product): Promise<Product>;
  all(): Promise<Product[]>;
}

export class InMemoryCatalogRepository implements CatalogRepository {
  private readonly products = new Map<string, Product>();

  async create(product: Product): Promise<Product> {
    this.products.set(product.id, product);
    return product;
  }

  async all(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
}
