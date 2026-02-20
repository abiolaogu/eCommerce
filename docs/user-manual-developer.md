# User Manual: Developer — eCommerce Platform
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Introduction

### 1.1 Purpose
This manual provides developers with the technical guidance needed to set up, develop, test, and contribute to the FusionCommerce eCommerce Platform. It covers the development environment, codebase structure, coding conventions, API usage, and debugging techniques.

### 1.2 Audience
Software developers, backend engineers, and technical contributors working on the FusionCommerce platform.

### 1.3 Prerequisites
- Node.js 18+ and npm 9+
- Docker Desktop 4.x with at least 8 GB RAM allocated
- Git and a GitHub account
- TypeScript familiarity
- Basic knowledge of Kafka, PostgreSQL, and REST APIs

## 2. Development Environment Setup

### 2.1 Clone the Repository
```bash
git clone https://github.com/fusioncommerce/fusioncommerce.git
cd fusioncommerce
```

### 2.2 Install Dependencies
FusionCommerce uses npm native workspaces. Install all dependencies from the root:
```bash
npm install
```
This installs dependencies for all packages and services, creating symlinks for internal `@fusioncommerce/*` packages.

### 2.3 Start Infrastructure
Launch Redpanda (Kafka), PostgreSQL, and n8n via Docker Compose:
```bash
docker-compose up -d
```

### 2.4 Run Database Migrations
```bash
cd services/orders && npx knex migrate:latest
cd services/inventory && npx knex migrate:latest
cd services/group-commerce && npx knex migrate:latest
```

### 2.5 Start Services in Development Mode
Each service can be started independently:
```bash
# Terminal 1 - Catalog Service
cd services/catalog && npm run dev

# Terminal 2 - Orders Service
cd services/orders && npm run dev

# Terminal 3 - Inventory Service
cd services/inventory && npm run dev

# Terminal 4 - Group Commerce Service
cd services/group-commerce && npm run dev
```

## 3. Repository Structure

```
fusioncommerce/
  package.json              # Root workspace configuration
  tsconfig.base.json        # Shared TypeScript compiler options
  jest.preset.cjs           # Shared Jest configuration
  docker-compose.yml        # Local development orchestration
  .github/workflows/ci.yml  # CI pipeline
  packages/
    contracts/              # @fusioncommerce/contracts
    event-bus/              # @fusioncommerce/event-bus
    database/               # @fusioncommerce/database
  services/
    catalog/                # Catalog Service (port 3000)
    orders/                 # Orders Service (port 3001)
    inventory/              # Inventory Service (port 3002)
    group-commerce/         # Group Commerce Service (port 3003)
    payments/               # Payments Service (port 3004) - scaffolded
    shipping/               # Shipping Service (port 3005) - scaffolded
```

## 4. Service Architecture Pattern

Every FusionCommerce microservice follows the same layered architecture:

### 4.1 Entry Point (index.ts)
Bootstraps the Fastify server and connects to infrastructure:
```typescript
import { buildApp } from './app';
const app = await buildApp();
await app.listen({ port: 3000, host: '0.0.0.0' });
```

### 4.2 Application Builder (app.ts)
Configures the Fastify instance with routes, plugins, and middleware:
```typescript
export async function buildApp(opts?: { eventBus?: EventBus }) {
  const app = Fastify({ logger: true });
  // Register routes, validation schemas, etc.
  return app;
}
```

### 4.3 Service Layer (service.ts)
Contains business logic, decoupled from HTTP and persistence:
```typescript
export class CatalogService {
  constructor(
    private repository: CatalogRepository,
    private eventBus: EventBus
  ) {}
  async create(product: CreateProductInput): Promise<Product> { ... }
}
```

### 4.4 Repository Layer (repository.ts)
Data access abstraction with in-memory and PostgreSQL implementations:
```typescript
export interface CatalogRepository {
  save(product: Product): Promise<void>;
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
}
```

### 4.5 Types (types.ts)
Domain type definitions for the service:
```typescript
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency: Currency;
  inventory: number;
}
```

## 5. Shared Packages

### 5.1 @fusioncommerce/contracts
Shared event topics and typed interfaces used across all services:
```typescript
import {
  ORDER_CREATED_TOPIC,
  OrderCreatedEvent,
  Currency
} from '@fusioncommerce/contracts';
```

### 5.2 @fusioncommerce/event-bus
Kafka abstraction with two implementations:
- **KafkaEventBus** -- Production implementation using kafkajs
- **InMemoryEventBus** -- In-memory implementation for unit testing

```typescript
import { createEventBus } from '@fusioncommerce/event-bus';

// Production: connects to Kafka
const eventBus = createEventBus({ brokers: ['localhost:9092'] });

// Testing: in-memory
const eventBus = createEventBus({ type: 'memory' });
```

### 5.3 @fusioncommerce/database
Knex-based PostgreSQL connection factory:
```typescript
import { createDatabase } from '@fusioncommerce/database';

const db = createDatabase({
  connectionString: process.env.DATABASE_URL,
  poolMin: 2,
  poolMax: 10
});
```

## 6. Event-Driven Communication

### 6.1 Publishing Events
```typescript
await this.eventBus.publish(ORDER_CREATED_TOPIC, {
  orderId: order.id,
  customerId: order.customerId,
  total: order.total,
  items: order.items
});
```

### 6.2 Subscribing to Events
```typescript
await this.eventBus.subscribe(ORDER_CREATED_TOPIC, async (event) => {
  const orderEvent = event as OrderCreatedEvent;
  await this.reserveInventory(orderEvent);
});
```

### 6.3 Event Contract

All event payloads must be defined in `@fusioncommerce/contracts`. Key events:

| Topic | Payload Type | Description |
|-------|-------------|-------------|
| order.created | OrderCreatedEvent | New order placed |
| inventory.reserved | InventoryStatusEvent | Stock reserved |
| inventory.insufficient | InventoryStatusEvent | Stock unavailable |
| payment.created | PaymentEvent | Payment initiated |
| payment.succeeded | PaymentEvent | Payment confirmed |
| payment.failed | PaymentEvent | Payment rejected |
| shipping.label.created | ShippingLabelEvent | Label generated |

## 7. API Development

### 7.1 Route Registration
Routes are registered in the app builder using Fastify's route configuration:
```typescript
app.post('/products', {
  schema: {
    body: createProductSchema,
    response: { 201: productResponseSchema }
  }
}, async (request, reply) => {
  const product = await service.create(request.body);
  reply.status(201).send(product);
});
```

### 7.2 Request Validation
Fastify uses JSON Schema for request validation. Schemas are defined inline or in separate files:
```typescript
const createProductSchema = {
  type: 'object',
  required: ['sku', 'name', 'price', 'currency', 'inventory'],
  properties: {
    sku: { type: 'string' },
    name: { type: 'string' },
    price: { type: 'number', minimum: 0 },
    currency: { type: 'string', minLength: 3, maxLength: 3 },
    inventory: { type: 'integer', minimum: 0 }
  }
};
```

### 7.3 Health Check Endpoint
Every service must expose a health endpoint:
```typescript
app.get('/health', async () => ({ status: 'ok', service: 'catalog' }));
```

## 8. Database Development

### 8.1 Creating Migrations
```bash
cd services/orders
npx knex migrate:make create_new_table
```

### 8.2 Migration Structure
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('table_name', (table) => {
    table.string('id').primary();
    table.string('tenant_id').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('table_name');
}
```

### 8.3 Repository Pattern
Always implement both InMemory and Postgres repository classes:
```typescript
// InMemory for testing
export class InMemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();
  // ...
}

// Postgres for production
export class PostgresOrderRepository implements OrderRepository {
  constructor(private db: Knex) {}
  // ...
}
```

## 9. Testing

### 9.1 Unit Testing
Tests are written using Jest. Each service has its own test configuration:
```bash
npm test                 # Run all tests from root
cd services/catalog && npm test  # Run catalog tests only
```

### 9.2 Test Structure
```typescript
describe('CatalogService', () => {
  let service: CatalogService;
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    eventBus = new InMemoryEventBus();
    service = new CatalogService(new InMemoryRepository(), eventBus);
  });

  it('should create a product and emit event', async () => {
    const product = await service.create({ sku: 'TEST', name: 'Test', price: 10, currency: 'USD', inventory: 5 });
    expect(product.id).toBeDefined();
    expect(eventBus.getPublished('product.created')).toHaveLength(1);
  });
});
```

### 9.3 Integration Testing
Integration tests verify service-to-service communication through Kafka:
```bash
docker-compose up -d  # Start infrastructure
npm run test:integration
```

## 10. CI/CD Pipeline

### 10.1 GitHub Actions
The CI pipeline is defined in `.github/workflows/ci.yml` and runs:
1. Lint checks (ESLint)
2. TypeScript compilation (tsc --noEmit)
3. Unit tests (Jest)
4. Docker image builds

### 10.2 Local CI Simulation
```bash
npm run lint
npm run build
npm test
```

## 11. Coding Conventions

### 11.1 TypeScript Standards
- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` types in public APIs
- Use interfaces for domain models, types for unions/intersections
- Prefer async/await over raw Promises

### 11.2 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `catalog-service.ts` |
| Classes | PascalCase | `CatalogService` |
| Interfaces | PascalCase | `OrderRepository` |
| Functions/Methods | camelCase | `createProduct()` |
| Constants | UPPER_SNAKE_CASE | `ORDER_CREATED_TOPIC` |
| Event Topics | dot.separated | `order.created` |

### 11.3 Git Workflow
- Create feature branches from `main`
- Use conventional commit messages: `feat:`, `fix:`, `docs:`, `chore:`
- Open pull requests for review before merging
- CI must pass before merge

## 12. Debugging

### 12.1 Service Logs
Fastify's built-in logger provides structured JSON logs:
```bash
LOG_LEVEL=debug npm run dev
```

### 12.2 Kafka Event Inspection
Use the Redpanda Console at http://localhost:8080 to:
- View topic messages
- Monitor consumer groups
- Check partition assignments

### 12.3 Database Queries
Use the Knex debug mode for SQL logging:
```typescript
const db = createDatabase({ connectionString: '...', debug: true });
```

### 12.4 Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Module not found: @fusioncommerce/* | Dependencies not linked | Run `npm install` from root |
| Kafka connection refused | Redpanda not running | Run `docker-compose up -d` |
| Migration failed | Schema conflict | Check migration order and rollback |
| Port already in use | Service already running | Kill process: `lsof -i :<port>` |
| TypeScript compilation error | Missing type in contracts | Update @fusioncommerce/contracts |
