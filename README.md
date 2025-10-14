# FusionCommerce Platform

FusionCommerce is an API-first, event-driven, and composable commerce platform built around Apache Kafka, n8n, and AI-driven services. The repository now contains a deployable reference implementation that demonstrates how catalog, order, and inventory microservices collaborate asynchronously through Kafka topics. Each service is designed for containerized CI/CD pipelines and ships with automated tests, TypeScript builds, and Docker artifacts.

## Architectural Overview

FusionCommerce is organized into six independent yet interoperable layers that can be deployed individually or combined for end-to-end commerce capabilities. Each layer communicates through Kafka-powered events and exposed APIs, ensuring loose coupling and high scalability.

### 1. Headless Presentation Layer

The "heads" deliver customer-facing experiences that consume FusionCommerce APIs without depending on specific backend implementations.

- **Web & Mobile Storefronts**: Traditional or progressive web apps built with frameworks such as Next.js or Vue Storefront.
- **Social & Content Commerce**: Embedded shopping experiences for platforms like TikTok or Instagram, following proven Douyin-style models.
- **Conversational Commerce**: Chatbot-driven journeys on messaging platforms such as WhatsApp and Messenger.
- **Immersive Commerce**: AR/VR-powered browsing and purchasing flows.
- **In-Store Digital Experiences**: Smart kiosks, scan-and-go mobile apps, and other O2O touchpoints inspired by Freshippo.

### 2. Commerce Core Services

Composable, headless microservices implement business logic and expose granular APIs.

- **Core Commerce**: Catalog/PIM, Orders/OMS, Inventory, and Customer domains.
- **Group Commerce**: Supports social group buying mechanics popularized by Pinduoduo and Meesho.
- **Livestream Commerce**: Manages live events, real-time product pinning, and interactive chat similar to Taobao Live.
- **Community & UGC**: Powers content-driven trust and discovery experiences like Xiaohongshu.
- **Wallet & Loyalty**: Handles stored value, points, referrals, and gamified incentives inspired by Paytm and Mercado Libre.
- **Hyperlocal Commerce**: Coordinates local fulfillment networks and agent-based delivery à la JioMart and JD.com.
- **Customer-as-Creator**: Enables C2M and crowdfunding models seen in Kickstarter and Temu ecosystems.

### 3. Eventing & Workflow Orchestration

- **Apache Kafka** operates as the central event bus. Every domain emits and consumes domain events (for example `order.created`, `inventory.reserved`) to maintain real-time, auditable state transitions.
- **n8n** listens to Kafka topics to orchestrate multi-step workflows. Low-code builders can chain actions such as fraud checks, inventory reservations, payment execution, and omnichannel notifications without modifying microservice code.

### 4. Intelligence & Data Layer

- **Real-Time Analytics**: Apache Druid consumes Kafka streams to drive operational dashboards for sales funnels, CLV, and inventory heatmaps.
- **AI Decisioning Plane**: Specialized microservices deliver intelligence-as-a-service, including personalization/recommendations, dynamic pricing and promotions, fraud detection, marketing attribution, and supply chain optimization.

### 5. State & Storage Layer

Polyglot persistence ensures each workload uses an optimal datastore.

- **YugabyteDB** for strongly consistent transactional data such as orders and customer profiles.
- **ScyllaDB or Aerospike** for ultra-low-latency access to sessions, real-time counters, and wallet balances.
- **MinIO** for object storage of images, video, AR/VR assets, and user-generated content backed by performant block storage.

### 6. Infrastructure & Operations

- **Kubernetes (via Rancher)** orchestrates microservices with autoscaling, resilience, and service mesh integrations.
- **GitOps Toolchain**: GitLab CI builds and tests workloads, while ArgoCD continuously deploys them across environments.
- **Cloud & Edge Fabric**: Deployable on private OpenStack clouds or major hyperscalers, with Cloudflare and Voxility delivering secure, low-latency global edge access.

## Deployable Reference Implementation

The repository now ships production-ready Node.js microservices implemented in TypeScript. Each service is containerized, tested, and built around a shared Kafka event contract to illustrate the FusionCommerce nervous system.

### Packages

- `@fusioncommerce/contracts`: Shared event names and payload typings (`order.created`, `inventory.reserved`, `inventory.insufficient`).
- `@fusioncommerce/event-bus`: Kafka and in-memory event bus implementations with an environment-driven factory for local testing versus production brokers.

### Services

- **Catalog Service (`services/catalog`)** exposes REST endpoints to create and list products while emitting `product.created` events.
- **Orders Service (`services/orders`)** validates order payloads, persists them in a repository abstraction, and publishes `order.created` messages.
- **Inventory Service (`services/inventory`)** maintains stock levels, listens for `order.created`, and publishes reservation outcomes to downstream consumers.

Each service offers Fastify-based HTTP APIs, health endpoints, and clean shutdown hooks. Business logic is encapsulated in dedicated service classes with in-memory repositories to keep the sample lightweight while remaining production-ready for replacement with SQL/NoSQL adapters.

### Local Development

```bash
npm install    # installs dependencies across all workspaces (requires registry access)
npm run lint   # type-checks each workspace
npm run test   # runs Jest-based unit tests for all services and packages
npm run build  # compiles TypeScript to production-ready JavaScript
```

If your environment restricts access to the public npm registry, you can configure a private mirror or offline cache before running the commands above.

### Container Orchestration

Build and run the entire stack locally with Docker Compose. This spins up Kafka, Zookeeper, the three microservices, and an n8n automation node ready to orchestrate workflows.

```bash
docker compose up --build
```

Environment variables:

- `KAFKA_BROKERS` – Comma-separated list of Kafka bootstrap servers (defaults to the local Compose broker).
- `USE_IN_MEMORY_BUS` – Set to `true` to bypass Kafka and use the in-memory bus for local testing.

### Continuous Delivery

The Dockerfiles located in each service directory implement multi-stage builds that compile TypeScript, prune dev dependencies, and produce small production images. These images can be pushed to any container registry and deployed to Kubernetes or other orchestrators. The `ci` npm script (`npm run ci`) runs linting, unit tests, and builds across all workspaces, enabling a single command for automated pipelines.

## Event-Driven Workflow Example

1. A customer places an order via the Orders service, generating an `order.created` event on Kafka (or the in-memory bus during development).
2. The Inventory service consumes the event, reserves stock, and emits either `inventory.reserved` or `inventory.insufficient` to notify downstream processors.
3. n8n reacts to inventory events to trigger fraud checks, notifications, or fulfillment automations.
4. Catalog updates can drive personalization engines and promotional workflows by emitting `product.created` events to analytic and AI layers.

## Innovation Mapping

| Innovation Model | Global Inspirations | Enabling Components |
| --- | --- | --- |
| Social Group Buying | Pinduoduo, Meesho | Group Commerce Service, Kafka Events, n8n workflows, ScyllaDB real-time counters |
| Livestream Commerce | Taobao Live, Douyin | Livestream Service (WebRTC), Kafka product pinning events, Apache Druid analytics |
| Community & Trust | Xiaohongshu | Community & UGC Service, MinIO media storage, AI content moderation & trust scoring |
| Hyperlocal O2O | JioMart, Freshippo | Hyperlocal Service, Kafka location events, n8n routing flows, AI logistics optimizers |
| Gamified Commerce | Temu, Shopee | Wallet & Loyalty Service, AI-driven dynamic rewards, n8n-triggered game mechanics |
| Open Network Commerce | ONDC (India) | API-first architecture, standardized Kafka events enabling plug-and-play buyer/seller applications |

## Additional Resources

The repository includes supplementary diagrams and reference material (PDF and DOCX) that provide visual renderings of the architecture, Kafka event flows, and global infrastructure guidance.
