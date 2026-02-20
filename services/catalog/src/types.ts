export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  inventory: number;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  inventory: number;
}

export interface ListProductsQuery {
  limit?: number;
  offset?: number;
}
