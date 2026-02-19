# Frontend Architecture

This repository follows a unified frontend standard:

- Web: Refine v4 + Ant Design 5 + React Query (headless CRUD)
- Flutter: Ferry GraphQL + Riverpod + GoRouter (clean architecture)
- Android: Jetpack Compose + Apollo Kotlin + Hilt + Orbit MVI
- iOS: SwiftUI + Apollo iOS + TCA

Reference entities and CRUD flows use `User`, `Organization`, and `Project` when available.
Fallback entity is `Item` when schema differs.

## Structure

- `web/` React + Refine reference app
- `flutter/` Flutter reference app
- `android/` Compose reference app
- `ios/` SwiftUI + TCA reference app

## CI Contract

GitHub Actions are wired to run schema pull/codegen/tests when Hasura metadata,
schema, or GraphQL operation files change.

## OmniRoute SDK Wiring

Checkout orchestration is standardized to a single SDK package in
`/Users/AbiolaOgunsakin1/eCommerce/eCommerce/packages/omniroute-sdk`:

- Service path:
  - `services/orders/src/index.ts` and `services/shipping/src/index.ts` construct the client via `createOmniRouteClientFromEnv(...)`.
  - Service domain logic maps items with `normalizeFusionPolicyLines(...)` and evaluates policy/lanes using the same client.
- Frontend path:
  - `web/src/App.tsx` performs direct policy preview through `createOmniRouteClient(...)`.
  - `web/src/App.tsx` performs service-backed calls through `createFusionServiceAdapters(...)` for:
    - `POST /orders/policy-preview`
    - `POST /orders`
    - `POST /shipping/lane-preview`

This keeps SDK behavior consistent across browser and service execution paths.
