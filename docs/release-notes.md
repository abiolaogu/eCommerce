# Release Notes — eCommerce Platform
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## Release Overview

This document tracks all releases of the FusionCommerce eCommerce Platform, including new features, improvements, bug fixes, known issues, and upgrade instructions.

---

## v1.0.0 — Foundation Release
**Release Date**: 2026-02-18
**Release Type**: Major
**Status**: Current

### Summary
Initial release of the FusionCommerce eCommerce Platform establishing the composable, event-driven microservices foundation. This release delivers four production-ready services, two scaffolded services, three shared packages, and complete infrastructure configuration.

### New Features

#### Core Services
- **Catalog Service (port 3000)**
  - Product creation with SKU, name, description, price, currency, and inventory
  - Product listing via REST API (GET /products)
  - Event emission (`product.created`) to Kafka on product creation
  - JSON schema validation for all request payloads
  - Health check endpoint (GET /health)

- **Orders Service (port 3001)**
  - Order creation with customer ID, line items, and auto-calculated totals
  - Multi-currency support (USD, EUR, GBP, JPY)
  - Order persistence to PostgreSQL via Knex migrations
  - Event emission (`order.created`) to Kafka
  - Order listing via REST API (GET /orders)

- **Inventory Service (port 3002)**
  - Automatic inventory reservation on `order.created` events
  - Event-driven stock management (`inventory.reserved`, `inventory.insufficient`)
  - REST API for inventory queries and manual adjustments
  - PostgreSQL persistence with Knex migrations

- **Group Commerce Service (port 3003)**
  - Group buying campaign creation with min/max participant thresholds
  - Campaign join functionality (POST /campaigns/:id/join)
  - Automatic campaign success trigger at minimum participant count
  - Campaign lifecycle events (created, joined, successful)
  - PostgreSQL persistence with Knex migrations

#### Scaffolded Services
- **Payments Service (port 3004)** -- Package structure with Stripe dependency declared
- **Shipping Service (port 3005)** -- Package structure with contract topics defined

#### Shared Packages
- **@fusioncommerce/contracts** -- 12 event topics and 8 typed interfaces
- **@fusioncommerce/event-bus** -- KafkaEventBus and InMemoryEventBus with factory function
- **@fusioncommerce/database** -- Knex-based PostgreSQL connection factory with pool configuration

#### Infrastructure
- Docker Compose configuration for local development (8 containers)
- Redpanda (Kafka-compatible) event bus with internal/external listeners
- n8n workflow engine (v1.70.1) with basic authentication
- PostgreSQL database with service-specific schemas
- GitHub Actions CI pipeline (lint, build, test, Docker)

### Architecture Highlights
- API-first design with Fastify REST endpoints and JSON schema validation
- Event-driven communication via Kafka topics with typed contracts
- Composable microservices with independent deployment capability
- npm native workspaces monorepo structure
- Repository pattern with InMemory and PostgreSQL implementations
- Multi-tenant readiness with tenant_id partitioning design

### Known Issues

| ID | Severity | Description | Workaround |
|----|----------|-------------|------------|
| KI-001 | Medium | Payments Service has no implementation beyond package.json | Manual payment tracking |
| KI-002 | Medium | Shipping Service has no implementation beyond package.json | Manual shipment creation |
| KI-003 | Low | ESM/CJS module mismatch may cause friction with pure ESM dependencies | Use CommonJS-compatible versions |
| KI-004 | Low | Catalog Service uses InMemory persistence only (no Postgres adapter) | Data is not persisted across restarts |
| KI-005 | Medium | No API Gateway or authentication layer deployed | Services are exposed without auth |
| KI-006 | Low | n8n has no pre-configured workflow definitions | Workflows must be created manually |
| KI-007 | Medium | No Kubernetes manifests or Helm charts exist | Docker Compose only |
| KI-008 | Low | e2e-tests package is scaffolded but contains no test files | Manual API testing only |

### Breaking Changes
None (initial release).

### Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Node.js | 18 LTS | Runtime |
| TypeScript | 5.x | Language |
| Fastify | 4.x | HTTP framework |
| KafkaJS | 2.x | Kafka client |
| Knex | 3.x | SQL query builder |
| Jest | 29.x | Testing |
| Docker | 24+ | Containerization |
| Redpanda | Latest | Event streaming |
| n8n | 1.70.1 | Workflow engine |

### Upgrade Instructions
Not applicable (initial release). For fresh installation, follow the deployment guide.

---

## Planned Releases

### v1.1.0 — Payments and Shipping (Planned)
**Target Date**: Q2 2026

- Full Payments Service implementation with Stripe integration
- Full Shipping Service implementation with label generation
- Stripe webhook handling for payment status updates
- Shipping carrier API integrations
- End-to-end order-to-delivery workflow via n8n

### v1.2.0 — Search and Media (Planned)
**Target Date**: Q3 2026

- Full-text product search with faceted filtering
- Product image and media upload to MinIO
- Product variant management (size, color, material)
- Product categories and hierarchical taxonomy
- Multi-vendor product attribution

### v1.3.0 — Security and Multi-Tenancy (Planned)
**Target Date**: Q3 2026

- API Gateway with JWT authentication and rate limiting
- Multi-tenant data isolation enforcement
- TLS encryption for all inter-service communication
- Role-based access control (RBAC)
- Audit logging

### v2.0.0 — Kubernetes and Production Readiness (Planned)
**Target Date**: Q4 2026

- Kubernetes Helm charts for all services
- Horizontal pod autoscaling (HPA) configuration
- Prometheus metrics and Grafana dashboards
- OpenTelemetry distributed tracing
- ArgoCD GitOps deployment pipeline
- Production-grade PostgreSQL with connection pooling (PgBouncer)
- Kafka topic partitioning and replication for high availability

### v2.1.0 — Social Commerce (Planned)
**Target Date**: Q1 2027

- Livestream commerce service
- Community/UGC service
- Social sharing integrations (WhatsApp, TikTok)
- Creator-led commerce features

### v2.2.0 — AI and Intelligence (Planned)
**Target Date**: Q2 2027

- AI recommendation engine
- Dynamic pricing engine
- Fraud detection service
- Real-time analytics with Apache Druid
- Operational dashboards

---

## Release Process

### Versioning
FusionCommerce follows Semantic Versioning (SemVer):
- **Major** (X.0.0): Breaking API or event contract changes
- **Minor** (0.X.0): New features, backward-compatible
- **Patch** (0.0.X): Bug fixes, backward-compatible

### Release Checklist
1. All CI checks pass (lint, build, test)
2. Release branch created from main
3. Version numbers updated in all package.json files
4. Database migrations tested (up and down)
5. Docker images built and tagged
6. Release notes documented
7. Stakeholder sign-off obtained
8. Tag created and pushed
9. Docker images published to registry
10. Deployment to staging environment
11. Smoke tests pass on staging
12. Production deployment (manual approval)
13. Post-deployment monitoring for 24 hours

### Rollback Procedure
1. Revert to previous Docker image tags
2. Run database migration rollback if schema changed
3. Verify service health via /health endpoints
4. Monitor Kafka consumer group lag for event processing delays
5. Notify stakeholders of rollback
