export interface OrderItem {
  sku: string;
  category?: string;
  quantity: number;
  price: number;
}

export interface PolicyCheckSnapshot {
  compliant: boolean;
  coverageLane: string;
  expectedSlaHours: number;
  checks: Array<{
    category: string;
    quantity: number;
    requiredMOQ: number;
    compliant: boolean;
  }>;
  automationNotes: string[];
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: 'created' | 'confirmed' | 'failed';
  brandId?: string;
  destinationState?: string;
  orchestration?: PolicyCheckSnapshot;
  createdAt: string;
}

export interface CreateOrderRequest {
  customerId: string;
  items: Array<{
    sku: string;
    category?: string;
    quantity: number;
    price: number;
  }>;
  currency?: string;
  tenantId?: string;
  brandId?: string;
  destinationState?: string;
}

export interface PolicyPreviewRequest {
  tenantId?: string;
  brandId: string;
  destinationState: string;
  items: Array<{
    sku: string;
    category: string;
    quantity: number;
  }>;
}

export interface ListOrdersQuery {
  limit?: number;
  offset?: number;
}
