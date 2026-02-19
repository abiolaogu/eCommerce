import type { CoverageLaneResponse, PolicyCheckRequest, PolicyCheckResponse } from './index';

export interface FusionPolicyLineInput {
  sku: string;
  category?: string;
  quantity: number;
}

export interface FusionOrderDraft {
  brandId: string;
  destinationState: string;
  items: FusionPolicyLineInput[];
}

export interface FusionCheckoutLine {
  sku: string;
  category?: string;
  quantity: number;
  price: number;
}

export interface FusionPolicyPreviewRequest {
  tenantId?: string;
  brandId: string;
  destinationState: string;
  items: FusionPolicyLineInput[];
}

export interface FusionCreateOrderRequest {
  customerId: string;
  tenantId?: string;
  brandId?: string;
  destinationState?: string;
  currency?: string;
  items: FusionCheckoutLine[];
}

export interface FusionServiceAdapterConfig {
  ordersServiceUrl: string;
  shippingServiceUrl: string;
  fetchImpl?: typeof fetch;
}

const normalizeServiceUrl = (value: string): string => value.replace(/\/+$/, '');

const parseServiceResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Fusion service request failed: ${response.status} ${message}`);
  }

  return response.json() as Promise<T>;
};

export const normalizeFusionPolicyLines = (
  items: FusionPolicyLineInput[],
  fallbackCategory = 'General'
): Array<{ sku: string; category: string; quantity: number }> => {
  return items.map((item) => ({
    sku: item.sku,
    category: item.category || fallbackCategory,
    quantity: item.quantity,
  }));
};

export const mapFusionOrderToPolicyRequest = (draft: FusionOrderDraft): PolicyCheckRequest => {
  return {
    brandId: draft.brandId,
    destinationState: draft.destinationState,
    lines: normalizeFusionPolicyLines(draft.items),
  };
};

export const createFusionServiceAdapters = (config: FusionServiceAdapterConfig) => {
  const fetchImpl = config.fetchImpl ?? fetch;
  const ordersServiceUrl = normalizeServiceUrl(config.ordersServiceUrl);
  const shippingServiceUrl = normalizeServiceUrl(config.shippingServiceUrl);

  return {
    async previewPolicy(input: FusionPolicyPreviewRequest): Promise<PolicyCheckResponse> {
      const response = await fetchImpl(`${ordersServiceUrl}/orders/policy-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: input.tenantId,
          brandId: input.brandId,
          destinationState: input.destinationState,
          items: normalizeFusionPolicyLines(input.items),
        }),
      });

      return parseServiceResponse<PolicyCheckResponse>(response);
    },

    async createOrder(input: FusionCreateOrderRequest): Promise<Record<string, unknown>> {
      const response = await fetchImpl(`${ordersServiceUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      return parseServiceResponse<Record<string, unknown>>(response);
    },

    async previewShippingLanes(destinationState: string): Promise<CoverageLaneResponse[]> {
      const response = await fetchImpl(`${shippingServiceUrl}/shipping/lane-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destinationState }),
      });

      const payload = await parseServiceResponse<{ lanes: CoverageLaneResponse[] }>(response);
      return payload.lanes;
    },
  };
};
