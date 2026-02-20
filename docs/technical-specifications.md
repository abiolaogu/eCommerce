# Technical Specifications — eCommerce Platform
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Introduction

### 1.1 Purpose
This document defines the technical specifications for the FusionCommerce eCommerce Platform, covering the technology stack, API contracts, data formats, communication protocols, infrastructure components, and performance benchmarks.

### 1.2 Scope
All six microservices (Catalog, Orders, Inventory, Group Commerce, Payments, Shipping), three shared packages (contracts, event-bus, database), and supporting infrastructure (Redpanda, n8n, PostgreSQL).

## 2. Technology Stack

### 2.1 Runtime and Language

| Component | Specification |
|-----------|--------------|
| Language | TypeScript 5.x |
| Runtime | Node.js 18 LTS (or later) |
| Module System | CommonJS (compiled), ES module source |
| Package Manager | npm 9+ with native workspaces |
| Build Tool | TypeScript Compiler (tsc) |

### 2.2 Frameworks and Libraries

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| HTTP Server | Fastify | 4.x | REST API framework with JSON schema validation |
| Query Builder | Knex.js | 3.x | PostgreSQL query builder and migrations |
| Event Streaming | KafkaJS | 2.x | Apache Kafka client for Node.js |
| Testing | Jest | 29.x | Unit and integration testing framework |
| Payment Processing | Stripe SDK | Latest | Payment gateway integration |
| Workflow Engine | n8n | 1.70.x | Low-code workflow orchestration |

### 2.3 Infrastructure Components

| Component | Technology | Version | Port |
|-----------|-----------|---------|------|
| Event Bus | Redpanda (Kafka-compatible) | Latest | 9092 (internal), 19092 (external) |
| Database | PostgreSQL | 15+ | 5432 |
| Workflow Engine | n8n | 1.70.1 | 5678 |
| Object Storage | MinIO (planned) | Latest | 9000 |
| Container Runtime | Docker | 24+ | -- |
| Orchestration | Kubernetes (planned) | 1.28+ | -- |

## 3. API Specifications

### 3.1 Catalog Service API (Port 3000)

#### POST /products
Create a new product in the catalog.

**Request:**
```json
{
  "sku": "string (required)",
  "name": "string (required)",
  "description": "string (optional)",
  "price": "number >= 0 (required)",
  "currency": "string, 3 chars (required)",
  "inventory": "integer >= 0 (required)"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "sku": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "currency": "string",
  "inventory": "number"
}
```

#### GET /products
List all products in the catalog.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "sku": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "currency": "string",
    "inventory": "number"
  }
]
```

### 3.2 Orders Service API (Port 3001)

#### POST /orders
Create a new order.

**Request:**
```json
{
  "customerId": "string (required)",
  "items": [
    {
      "sku": "string (required)",
      "quantity": "integer > 0 (required)",
      "price": "number >= 0 (required)"
    }
  ],
  "currency": "string, 3 chars (required)"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "customerId": "string",
  "items": [ ... ],
  "total": "number",
  "currency": "string",
  "status": "created",
  "createdAt": "ISO 8601 timestamp"
}
```

#### GET /orders
List all orders.

### 3.3 Inventory Service API (Port 3002)

#### GET /inventory
List current inventory levels.

#### PUT /inventory
Update inventory for a specific SKU.

**Request:**
```json
{
  "sku": "string (required)",
  "quantity": "integer >= 0 (required)"
}
```

### 3.4 Group Commerce Service API (Port 3003)

#### POST /campaigns
Create a group buying campaign.

**Request:**
```json
{
  "productId": "string (required)",
  "minParticipants": "integer > 0 (required)",
  "maxParticipants": "integer > minParticipants (required)",
  "discountPercentage": "number 0-100 (required)",
  "expiresAt": "ISO 8601 timestamp (required)"
}
```

#### GET /campaigns
List all campaigns.

#### POST /campaigns/:id/join
Join an active campaign.

**Request:**
```json
{
  "userId": "string (required)"
}
```

### 3.5 Payments Service API (Port 3004)

#### POST /payments
Initiate a payment for an order.

#### GET /payments
List payment records.

#### POST /webhook
Stripe webhook callback endpoint.

### 3.6 Shipping Service API (Port 3005)

#### POST /shipments
Create a shipment for a paid order.

#### GET /shipments
List shipment records.

#### GET /tracking/:trackingId
Get tracking information for a shipment.

### 3.7 Common Endpoints (All Services)

#### GET /health
Health check endpoint returning service status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "service-name",
  "timestamp": "ISO 8601"
}
```

## 4. Event Specifications

### 4.1 Event Bus Configuration

| Parameter | Value |
|-----------|-------|
| Protocol | Kafka Wire Protocol |
| Broker Address | localhost:9092 (internal), localhost:19092 (external) |
| Serialization | JSON |
| Partitions per Topic | 1 (default), 3-12 (production) |
| Replication Factor | 1 (development), 3 (production) |
| Retention Period | 7 days (default), 90 days (audit topics) |

### 4.2 Event Topic Registry

| Topic | Partition Key | Payload Schema | Publisher |
|-------|--------------|----------------|-----------|
| product.created | product.id | ProductCreatedEvent | Catalog Service |
| order.created | order.id | OrderCreatedEvent | Orders Service |
| inventory.reserved | order.id | InventoryStatusEvent | Inventory Service |
| inventory.insufficient | order.id | InventoryStatusEvent | Inventory Service |
| group-commerce.campaign.created | campaign.id | GroupCommerceCampaign | Group Commerce |
| group-commerce.campaign.joined | campaign.id | GroupCommerceCampaign | Group Commerce |
| group-commerce.campaign.successful | campaign.id | GroupCommerceCampaign | Group Commerce |
| payment.created | payment.id | PaymentEvent | Payments Service |
| payment.succeeded | payment.id | PaymentEvent | Payments Service |
| payment.failed | payment.id | PaymentEvent | Payments Service |
| shipping.label.created | shipment.id | ShippingLabelEvent | Shipping Service |

### 4.3 Event Payload Schemas

#### OrderCreatedEvent
```typescript
{
  orderId: string;
  customerId: string;
  total: number;
  items: Array<{ sku: string; quantity: number; price: number }>;
}
```

#### InventoryStatusEvent
```typescript
{
  orderId: string;
  status: 'reserved' | 'insufficient';
  sku?: string;
  quantity?: number;
}
```

#### GroupCommerceCampaign
```typescript
{
  id: string;
  productId: string;
  minParticipants: number;
  maxParticipants: number;
  actualParticipants: number;
  status: 'active' | 'successful' | 'expired';
}
```

## 5. Database Specifications

### 5.1 Connection Parameters

| Parameter | Development | Staging | Production |
|-----------|------------|---------|------------|
| Host | localhost | dbaas-staging | dbaas-production |
| Port | 5432 | 5432 | 5432 |
| Database | ecommerce | ecommerce_staging | ecommerce_prod |
| Pool Min | 2 | 2 | 5 |
| Pool Max | 10 | 10 | 50 |
| SSL | Disabled | Required | Required |

### 5.2 Table Specifications

#### orders
| Column | Type | Constraints |
|--------|------|-------------|
| id | VARCHAR | PRIMARY KEY |
| user_id | VARCHAR | NOT NULL |
| product_id | VARCHAR | NOT NULL |
| quantity | INTEGER | NOT NULL |
| total_price | DECIMAL(10,2) | NOT NULL |
| currency | VARCHAR | NOT NULL |
| status | VARCHAR | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

#### inventory
| Column | Type | Constraints |
|--------|------|-------------|
| id | VARCHAR | PRIMARY KEY |
| sku | VARCHAR | NOT NULL, UNIQUE |
| quantity | INTEGER | NOT NULL, DEFAULT 0 |
| reserved | INTEGER | NOT NULL, DEFAULT 0 |
| updated_at | TIMESTAMP | NOT NULL |

#### group_commerce_campaigns
| Column | Type | Constraints |
|--------|------|-------------|
| id | VARCHAR | PRIMARY KEY |
| product_id | VARCHAR | NOT NULL |
| min_participants | INTEGER | NOT NULL |
| max_participants | INTEGER | NOT NULL |
| actual_participants | INTEGER | NOT NULL, DEFAULT 0 |
| status | VARCHAR | NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

## 6. Security Specifications

### 6.1 Authentication

| Layer | Method | Implementation |
|-------|--------|---------------|
| API Gateway | JWT Bearer Token | OAuth 2.0 / OpenID Connect |
| n8n Dashboard | Basic Authentication | Username/Password via env vars |
| Service-to-Service | mTLS (planned) | Certificate-based authentication |
| Database | Password | Connection string credentials |

### 6.2 Encryption

| Data State | Method | Specification |
|------------|--------|--------------|
| In Transit | TLS 1.3 | All HTTP and Kafka connections |
| At Rest | AES-256 | PostgreSQL tablespace encryption |
| Payment Data | Stripe Tokenization | PCI DSS Level 1 compliant |

### 6.3 Multi-Tenant Isolation
- Row-level isolation via `tenant_id` column on all tables
- Database queries filtered by tenant context from JWT
- Kafka events tagged with tenant identifier

## 7. Performance Specifications

### 7.1 Response Time Targets

| Operation | P50 | P95 | P99 |
|-----------|-----|-----|-----|
| GET /products | 50ms | 200ms | 500ms |
| POST /products | 100ms | 300ms | 800ms |
| POST /orders | 150ms | 500ms | 1000ms |
| GET /orders | 80ms | 250ms | 600ms |
| Event publish | 10ms | 50ms | 100ms |
| Event consume + process | 20ms | 100ms | 250ms |

### 7.2 Throughput Targets

| Metric | Development | Staging | Production |
|--------|------------|---------|------------|
| Orders per minute | 100 | 500 | 1,000+ |
| Catalog queries per second | 50 | 200 | 1,000+ |
| Events per second | 100 | 500 | 5,000+ |
| Concurrent connections | 50 | 500 | 10,000+ |

### 7.3 Resource Limits

| Service | CPU Limit | Memory Limit | Connections |
|---------|-----------|-------------|-------------|
| Catalog | 500m | 512Mi | 10 DB + 1 Kafka |
| Orders | 1000m | 1Gi | 10 DB + 1 Kafka |
| Inventory | 1000m | 1Gi | 10 DB + 1 Kafka |
| Group Commerce | 500m | 512Mi | 10 DB + 1 Kafka |
| Payments | 500m | 512Mi | 10 DB + 1 Kafka |
| Shipping | 500m | 512Mi | 10 DB + 1 Kafka |

## 8. Networking Specifications

### 8.1 Service Ports

| Service | Container Port | Host Port | Protocol |
|---------|---------------|-----------|----------|
| Catalog | 3000 | 3000 | HTTP |
| Orders | 3001 | 3001 | HTTP |
| Inventory | 3002 | 3002 | HTTP |
| Group Commerce | 3003 | 3003 | HTTP |
| Payments | 3004 | 3004 | HTTP |
| Shipping | 3005 | 3005 | HTTP |
| Redpanda | 9092 | 19092 | Kafka |
| n8n | 5678 | 5678 | HTTP |
| PostgreSQL | 5432 | 5432 | PostgreSQL |

### 8.2 DNS and Service Discovery
- Development: localhost with explicit ports
- Kubernetes: ClusterIP services with DNS-based discovery
- Production: Internal load balancer with service mesh (planned)

## 9. Logging and Observability

### 9.1 Log Format
Structured JSON logs via Fastify's built-in Pino logger:
```json
{
  "level": "info",
  "time": 1708300000000,
  "msg": "Order created",
  "reqId": "uuid",
  "service": "orders",
  "orderId": "uuid",
  "customerId": "string"
}
```

### 9.2 Log Levels

| Level | Usage |
|-------|-------|
| fatal | Application crash |
| error | Operation failure requiring attention |
| warn | Degraded operation or unexpected condition |
| info | Normal operational events |
| debug | Detailed diagnostic information |
| trace | Fine-grained execution tracing |

### 9.3 Observability Stack (Planned)
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry + Jaeger
- **Logging**: Pino + Elasticsearch + Kibana
- **Alerting**: Grafana Alerting or PagerDuty
