# Training Manual: Developer — eCommerce Platform
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Introduction

### 1.1 Training Objectives
Upon completing this training, developers will be able to:
- Set up the FusionCommerce development environment from scratch
- Understand and navigate the monorepo structure
- Implement new features following established patterns
- Write and run unit and integration tests
- Publish and consume Kafka events using the event bus abstraction
- Create database migrations and repository implementations
- Debug services locally and in Docker

### 1.2 Training Duration
Estimated total training time: 24 hours across 6 modules.

### 1.3 Prerequisites
- Proficiency in TypeScript and Node.js
- Familiarity with REST APIs and HTTP
- Basic knowledge of Docker and containerization
- Experience with Git and GitHub workflows
- Understanding of relational databases and SQL

## 2. Module 1: Environment Setup and Orientation (3 hours)

### 2.1 Learning Objectives
- Clone and install the FusionCommerce repository
- Start the development infrastructure
- Verify all services are operational

### 2.2 Development Machine Setup

Ensure the following are installed:

| Tool | Version | Verification Command |
|------|---------|---------------------|
| Node.js | 18 LTS+ | `node --version` |
| npm | 9+ | `npm --version` |
| Docker Desktop | 4.x+ | `docker --version` |
| Git | 2.x+ | `git --version` |
| VS Code (recommended) | Latest | `code --version` |

Docker Desktop must have at least 8 GB RAM allocated (Preferences > Resources).

### 2.3 Repository Setup Exercise

**Step 1: Clone the repository**
```bash
git clone https://github.com/fusioncommerce/fusioncommerce.git
cd fusioncommerce
```

**Step 2: Install all dependencies**
```bash
npm install
```
This uses npm workspaces to install dependencies for all packages and services, creating symlinks for internal `@fusioncommerce/*` packages.

**Step 3: Start infrastructure**
```bash
docker-compose up -d
```

**Step 4: Run database migrations**
```bash
cd services/orders && npx knex migrate:latest && cd ../..
cd services/inventory && npx knex migrate:latest && cd ../..
cd services/group-commerce && npx knex migrate:latest && cd ../..
```

**Step 5: Start services**
```bash
cd services/catalog && npm run dev &
cd services/orders && npm run dev &
cd services/inventory && npm run dev &
cd services/group-commerce && npm run dev &
```

**Step 6: Verify**
```bash
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

### 2.4 Monorepo Structure Tour
Explore the following directories and understand each:

```
fusioncommerce/
  packages/
    contracts/    -> Event types and topic constants
    event-bus/    -> Kafka abstraction layer
    database/     -> Knex connection factory
  services/
    catalog/      -> Product management (port 3000)
    orders/       -> Order management (port 3001)
    inventory/    -> Stock management (port 3002)
    group-commerce/ -> Group buying (port 3003)
    payments/     -> Payment processing (port 3004) [scaffolded]
    shipping/     -> Shipping/fulfillment (port 3005) [scaffolded]
```

### 2.5 Exercise: Explore the Codebase
1. Open `packages/contracts/src/index.ts` and list all event topics
2. Open `services/catalog/src/app.ts` and identify the registered routes
3. Open `services/orders/src/order-service.ts` and trace the order creation flow
4. Open `docker-compose.yml` and list all configured services

### 2.6 Knowledge Check
- Q1: What command installs dependencies for all workspaces?
- Q2: What are the three shared packages and what does each do?
- Q3: Which services have PostgreSQL persistence vs. InMemory only?

## 3. Module 2: Service Architecture Pattern (4 hours)

### 3.1 Learning Objectives
- Understand the four-layer service architecture
- Implement a service following the established pattern
- Use dependency injection for testability

### 3.2 The Four-Layer Pattern

Every FusionCommerce service follows this structure:

```
service-name/
  src/
    index.ts            -> Entry point (bootstrap)
    app.ts              -> Fastify application builder (routes, middleware)
    <name>-service.ts   -> Business logic (domain operations)
    <name>-repository.ts -> Data access (InMemory + Postgres)
    types.ts            -> Domain type definitions
  migrations/           -> Knex database migrations
  package.json          -> Service metadata and dependencies
  tsconfig.json         -> TypeScript configuration extending base
```

### 3.3 Layer Responsibilities

**Entry Point (index.ts)**: Minimal bootstrapping code. Creates dependencies, builds the app, and starts the server.

**Application Builder (app.ts)**: Configures Fastify with routes, validation schemas, and middleware. Receives injected dependencies for testability.

**Service Layer (service.ts)**: Pure business logic. Does not know about HTTP or database specifics. Receives repository and event bus via constructor injection.

**Repository Layer (repository.ts)**: Data access abstraction. Interface + InMemory implementation (for tests) + PostgreSQL implementation (for production).

### 3.4 Exercise: Trace a Request Through All Layers
Using the Catalog Service as reference:

1. **index.ts**: Read how `buildApp()` is called and the server starts
2. **app.ts**: Find the POST /products route handler
3. **catalog-service.ts**: Read `CatalogService.create()` to see business logic
4. **catalog-repository.ts**: Read how the product is persisted
5. **contracts**: Read the `product.created` event type

Document the complete flow from HTTP request to Kafka event in your notes.

### 3.5 Exercise: Implement a New Endpoint
Add a GET /products/:id endpoint to the Catalog Service:

1. Define the route in `app.ts` with a path parameter schema
2. Add a `findById(id: string)` method to the repository interface
3. Implement `findById` in both InMemory and Postgres repositories
4. Add a `getProduct(id: string)` method to CatalogService
5. Wire the route to call `service.getProduct(request.params.id)`
6. Test with curl: `curl http://localhost:3000/products/<id>`

### 3.6 Knowledge Check
- Q1: Why is the app builder a separate function from the entry point?
- Q2: What is the purpose of having both InMemory and Postgres repositories?
- Q3: Which layer is responsible for Kafka event emission?

## 4. Module 3: Event-Driven Development (4 hours)

### 4.1 Learning Objectives
- Publish events to Kafka topics
- Subscribe to events and implement handlers
- Use the InMemoryEventBus for testing
- Add new event types to the contracts package

### 4.2 The EventBus Interface
```typescript
export interface EventBus {
  publish<T>(topic: string, payload: T): Promise<void>;
  subscribe<T>(topic: string, handler: (payload: T) => Promise<void>): Promise<void>;
}
```

Two implementations:
- **KafkaEventBus**: Connects to Redpanda/Kafka for real event streaming
- **InMemoryEventBus**: Stores events in memory for unit tests

### 4.3 Exercise: Add a New Event Type

**Step 1: Define the event in contracts**
Open `packages/contracts/src/index.ts` and add:
```typescript
export const PRODUCT_UPDATED_TOPIC = 'product.updated';
export interface ProductUpdatedEvent {
  productId: string;
  changes: Record<string, unknown>;
  updatedAt: string;
}
```

**Step 2: Rebuild the contracts package**
```bash
cd packages/contracts && npm run build
```

**Step 3: Publish the event from a service**
```typescript
import { PRODUCT_UPDATED_TOPIC, ProductUpdatedEvent } from '@fusioncommerce/contracts';

await this.eventBus.publish<ProductUpdatedEvent>(PRODUCT_UPDATED_TOPIC, {
  productId: product.id,
  changes: { price: newPrice },
  updatedAt: new Date().toISOString()
});
```

**Step 4: Subscribe to the event in another service**
```typescript
await this.eventBus.subscribe<ProductUpdatedEvent>(
  PRODUCT_UPDATED_TOPIC,
  async (event) => {
    console.log(`Product ${event.productId} updated`);
    // Handle the event
  }
);
```

### 4.4 Exercise: Verify Events with InMemoryEventBus
```typescript
describe('ProductService', () => {
  it('should publish product.updated event', async () => {
    const eventBus = new InMemoryEventBus();
    const service = new ProductService(repo, eventBus);

    await service.updatePrice('prod-1', 19.99);

    const events = eventBus.getPublished(PRODUCT_UPDATED_TOPIC);
    expect(events).toHaveLength(1);
    expect(events[0].productId).toBe('prod-1');
  });
});
```

### 4.5 Exercise: Observe Real Events
1. Open Redpanda Console at http://localhost:8080
2. Create a product via the Catalog API
3. Watch the `product.created` topic in real time
4. Create an order and observe the event chain:
   - `order.created` in Orders topic
   - `inventory.reserved` or `inventory.insufficient` in Inventory topic

### 4.6 Knowledge Check
- Q1: Where are all event topics and types defined?
- Q2: What is the difference between KafkaEventBus and InMemoryEventBus?
- Q3: How do you verify an event was published in a unit test?

## 5. Module 4: Database Development (4 hours)

### 5.1 Learning Objectives
- Create and run Knex database migrations
- Implement the PostgreSQL repository pattern
- Use the @fusioncommerce/database connection factory
- Write queries with the Knex query builder

### 5.2 Creating a Migration

```bash
cd services/orders
npx knex migrate:make add_shipping_address_to_orders
```

This creates a timestamped migration file in the `migrations/` directory.

### 5.3 Migration Structure
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', (table) => {
    table.string('shipping_address').nullable();
    table.string('shipping_city').nullable();
    table.string('shipping_country').nullable();
    table.string('shipping_postal_code').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('shipping_address');
    table.dropColumn('shipping_city');
    table.dropColumn('shipping_country');
    table.dropColumn('shipping_postal_code');
  });
}
```

### 5.4 Running Migrations
```bash
npx knex migrate:latest   # Run all pending migrations
npx knex migrate:rollback  # Rollback the last batch
npx knex migrate:status    # Check migration status
```

### 5.5 Exercise: Create a New Table
Create a `reviews` table for the Catalog Service:
1. Create a migration: `npx knex migrate:make create_reviews_table`
2. Define the schema: id, product_id, user_id, rating (1-5), comment, created_at
3. Run the migration
4. Verify the table exists by connecting to PostgreSQL

### 5.6 Repository Implementation Pattern
```typescript
export class PostgresOrderRepository implements OrderRepository {
  constructor(private db: Knex) {}

  async save(order: Order): Promise<void> {
    await this.db('orders').insert({
      id: order.id,
      user_id: order.customerId,
      total_price: order.total,
      currency: order.currency,
      status: order.status,
      created_at: new Date()
    });
  }

  async findAll(): Promise<Order[]> {
    const rows = await this.db('orders').select('*');
    return rows.map(this.toDomain);
  }

  private toDomain(row: any): Order {
    return {
      id: row.id,
      customerId: row.user_id,
      total: parseFloat(row.total_price),
      currency: row.currency,
      status: row.status
    };
  }
}
```

### 5.7 Knowledge Check
- Q1: What command creates a new Knex migration?
- Q2: Why must every migration have both `up` and `down` functions?
- Q3: How does the repository pattern decouple business logic from the database?

## 6. Module 5: Testing (4 hours)

### 6.1 Learning Objectives
- Write unit tests using Jest and InMemory implementations
- Write integration tests that verify event flows
- Run the test suite locally and in CI

### 6.2 Unit Test Structure
```typescript
import { CatalogService } from '../src/catalog-service';
import { InMemoryCatalogRepository } from '../src/catalog-repository';
import { InMemoryEventBus } from '@fusioncommerce/event-bus';

describe('CatalogService', () => {
  let service: CatalogService;
  let repository: InMemoryCatalogRepository;
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    repository = new InMemoryCatalogRepository();
    eventBus = new InMemoryEventBus();
    service = new CatalogService(repository, eventBus);
  });

  describe('create', () => {
    it('should generate a UUID for the new product', async () => {
      const product = await service.create({
        sku: 'TEST-001', name: 'Test', price: 10, currency: 'USD', inventory: 5
      });
      expect(product.id).toBeDefined();
      expect(product.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('should persist the product to the repository', async () => {
      const product = await service.create({
        sku: 'TEST-001', name: 'Test', price: 10, currency: 'USD', inventory: 5
      });
      const found = await repository.findById(product.id);
      expect(found).toEqual(product);
    });

    it('should publish a product.created event', async () => {
      await service.create({
        sku: 'TEST-001', name: 'Test', price: 10, currency: 'USD', inventory: 5
      });
      const events = eventBus.getPublished('product.created');
      expect(events).toHaveLength(1);
    });
  });
});
```

### 6.3 Exercise: Write Tests for a New Feature
Write tests for the GET /products/:id endpoint you implemented in Module 2:
1. Test that it returns the correct product when found
2. Test that it returns 404 when the product does not exist
3. Test with the InMemory repository

### 6.4 Running Tests
```bash
npm test                        # Run all tests from root
cd services/catalog && npm test  # Run catalog tests only
npm test -- --watch              # Watch mode for development
npm test -- --coverage           # Generate coverage report
```

### 6.5 CI Pipeline
The GitHub Actions pipeline runs on every push and pull request:
1. `npm run lint` -- ESLint code quality checks
2. `npm run build` -- TypeScript compilation
3. `npm test` -- Jest test suite
4. Docker image build verification

### 6.6 Knowledge Check
- Q1: Why do we use InMemoryEventBus in unit tests instead of KafkaEventBus?
- Q2: What is the standard Jest lifecycle method for test setup?
- Q3: What is the minimum code coverage target?

## 7. Module 6: Contributing and Code Review (5 hours)

### 7.1 Learning Objectives
- Follow the Git branching strategy
- Write conventional commit messages
- Submit pull requests for code review
- Review other developers' code

### 7.2 Git Workflow
1. Create a feature branch from `main`: `git checkout -b feat/add-product-search`
2. Make changes following the coding conventions
3. Write tests for all new functionality
4. Commit with conventional messages: `feat: add product search endpoint`
5. Push to remote: `git push origin feat/add-product-search`
6. Open a pull request on GitHub
7. Address reviewer feedback
8. Merge after CI passes and approval is received

### 7.3 Commit Message Convention

| Prefix | Usage | Example |
|--------|-------|---------|
| feat: | New feature | `feat: add product variant support` |
| fix: | Bug fix | `fix: correct order total calculation` |
| docs: | Documentation | `docs: update API reference for catalog` |
| chore: | Maintenance | `chore: upgrade Fastify to 4.25` |
| test: | Test additions | `test: add inventory reservation tests` |
| refactor: | Code restructure | `refactor: extract order validation logic` |

### 7.4 Code Review Checklist
When reviewing pull requests, verify:
- [ ] Code follows the four-layer service pattern
- [ ] New event types are added to @fusioncommerce/contracts
- [ ] Both InMemory and Postgres repository implementations exist
- [ ] Unit tests cover new business logic
- [ ] Database migrations include both `up` and `down`
- [ ] No hardcoded secrets or environment-specific values
- [ ] TypeScript strict mode passes (no `any` in public APIs)
- [ ] JSON schema validation for new API endpoints
- [ ] Health check endpoint maintained

### 7.5 Exercise: End-to-End Contribution
Complete the full development cycle for a small feature:
1. Create a feature branch
2. Implement a new field on orders (e.g., `notes`)
3. Create the database migration
4. Update the repository implementations
5. Add request validation
6. Write unit tests
7. Commit with a conventional message
8. Open a pull request

### 7.6 Knowledge Check
- Q1: What is the correct branch naming convention?
- Q2: What must a PR have before it can be merged?
- Q3: Name 3 items on the code review checklist.

## 8. Final Assessment

### 8.1 Capstone Project
Implement a complete feature end-to-end:
- Add a "wishlist" capability to the Catalog Service
- Create the data model and migration
- Implement InMemory and Postgres repositories
- Add REST endpoints (POST /wishlists, GET /wishlists/:userId)
- Emit a `wishlist.item.added` event
- Write unit tests achieving 80%+ coverage
- Submit as a pull request with proper commits

### 8.2 Passing Criteria
- Feature works correctly with both InMemory and Postgres
- Event is properly defined in contracts and published
- All tests pass
- Code follows established patterns
- Migration includes up and down
- Minimum score: 80%
