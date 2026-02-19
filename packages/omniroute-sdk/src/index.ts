export interface OmniRouteClientConfig {
  baseUrl: string;
  apiKey: string;
  tenantId?: string;
}

export interface OmniRouteEnvConfig {
  OMNIROUTE_API_BASE_URL?: string;
  OMNIROUTE_API_KEY?: string;
  OMNIROUTE_TENANT_ID?: string;
}

export interface PolicyCheckRequest {
  brandId: string;
  destinationState: string;
  lines: Array<{
    sku: string;
    category: string;
    quantity: number;
  }>;
}

export interface PolicyCheckResponse {
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

export interface CoverageLaneResponse {
  laneId: string;
  owner: string;
  ownerType: string;
  slaHours: number;
}

export interface OmniRouteClient {
  evaluateCheckoutPolicy(input: PolicyCheckRequest): Promise<PolicyCheckResponse>;
  listCoverageLanes(destinationState: string): Promise<CoverageLaneResponse[]>;
  triggerRebalance(payload: {
    brandId: string;
    reason: string;
    scope: 'national' | 'regional' | 'local';
  }): Promise<{ workflowId: string; status: string }>;
}

export const createOmniRouteClientFromEnv = (
  env: OmniRouteEnvConfig
): OmniRouteClient | undefined => {
  if (!env.OMNIROUTE_API_BASE_URL || !env.OMNIROUTE_API_KEY) {
    return undefined;
  }

  return createOmniRouteClient({
    baseUrl: env.OMNIROUTE_API_BASE_URL,
    apiKey: env.OMNIROUTE_API_KEY,
    tenantId: env.OMNIROUTE_TENANT_ID,
  });
};

const buildHeaders = (config: OmniRouteClientConfig): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };

  if (config.tenantId) {
    headers['X-Tenant-ID'] = config.tenantId;
  }

  return headers;
};

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OmniRoute API request failed: ${response.status} ${body}`);
  }

  return response.json() as Promise<T>;
};

export const createOmniRouteClient = (config: OmniRouteClientConfig): OmniRouteClient => {
  const headers = buildHeaders(config);

  return {
    async evaluateCheckoutPolicy(input: PolicyCheckRequest): Promise<PolicyCheckResponse> {
      const response = await fetch(`${config.baseUrl}/v1/orchestration/checkout-policy`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      });

      return parseJson<PolicyCheckResponse>(response);
    },

    async listCoverageLanes(destinationState: string): Promise<CoverageLaneResponse[]> {
      const url = new URL(`${config.baseUrl}/v1/orchestration/coverage-lanes`);
      url.searchParams.set('destinationState', destinationState);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      return parseJson<CoverageLaneResponse[]>(response);
    },

    async triggerRebalance(payload): Promise<{ workflowId: string; status: string }> {
      const response = await fetch(`${config.baseUrl}/v1/orchestration/rebalance`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      return parseJson<{ workflowId: string; status: string }>(response);
    },
  };
};

export * from './integration-adapters';
