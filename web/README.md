# Web Frontend (Refine + AntD + React Query)

## Stack

- `@refinedev/core`
- `@refinedev/antd`
- `antd` 5.x
- `@fusioncommerce/omniroute-sdk` (file dependency to `../packages/omniroute-sdk`)

The checkout UI uses:

- direct OmniRoute API calls through `createOmniRouteClient(...)` for tenant-aware policy previews
- service-backed orchestration through `createFusionServiceAdapters(...)` for orders and shipping flows

## Commands

```bash
npm install
npm run dev
npm run codegen
npm run test
```

## Environment

Set these variables for checkout orchestration:

- `VITE_OMNIROUTE_API_BASE_URL`
- `VITE_OMNIROUTE_PUBLIC_KEY`
- `VITE_OMNIROUTE_TENANT_ID`
- `VITE_ORDERS_SERVICE_URL` (default `http://localhost:3001`)
- `VITE_SHIPPING_SERVICE_URL` (default `http://localhost:3005`)

Use `.env.local` values from root `.env.example` as baseline.
