# Changelog

## 2026-02-19 - OmniRoute SDK Wiring (Second Pass)

- Added shared SDK helpers:
  - `createOmniRouteClientFromEnv(...)`
  - `createFusionServiceAdapters(...)`
  - `normalizeFusionPolicyLines(...)`
- Rewired `services/orders` and `services/shipping` startup to use `createOmniRouteClientFromEnv(...)`.
- Standardized policy mapping in service code paths using `normalizeFusionPolicyLines(...)`.
- Rewired `web/src/App.tsx` to:
  - use SDK adapters for orders/shipping service calls
  - keep direct SDK policy preview path tenant-aware
  - centralize request error handling for SDK and service actions
- Updated `web/package.json` and `web/README.md` for deterministic local SDK dependency wiring.

## 2026-02-18 - Frontend Stack Standardization

- Added unified frontend stack scaffolding for web, flutter, android, and ios.
- Added GraphQL schema/codegen scripts and CI workflows for metadata/schema triggers.
- Added docs for architecture and code generation workflow.

## 2026-02-18 - OmniRoute SDK In-Place Wiring

- Added shared package `@fusioncommerce/omniroute-sdk` under `packages/omniroute-sdk`.
- Wired OmniRoute policy preview and order-time orchestration into `services/orders`.
- Wired OmniRoute lane preview and lane-aware shipping label orchestration into `services/shipping`.
- Added new service endpoints:
  - `POST /orders/policy-preview`
  - `POST /shipping/lane-preview`
- Updated web frontend to use the same SDK directly and via service-backed orchestration paths.
- Added OmniRoute environment variables to `.env.example` and `docker-compose.yml`.
