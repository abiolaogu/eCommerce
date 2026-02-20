# User Manual: Administrator — eCommerce Platform
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Introduction

### 1.1 Purpose
This manual provides platform administrators with comprehensive guidance for managing and operating the FusionCommerce eCommerce Platform. It covers day-to-day administration tasks, system monitoring, user management, and troubleshooting procedures.

### 1.2 Audience
This document is intended for Platform Operators and System Administrators responsible for deploying, configuring, and maintaining the FusionCommerce infrastructure.

### 1.3 Prerequisites
- Familiarity with Docker and container orchestration
- Basic understanding of RESTful APIs and JSON
- Access to the platform's infrastructure (Docker host or Kubernetes cluster)
- SSH or terminal access to deployment environment

## 2. System Access

### 2.1 Admin Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Catalog Service | http://localhost:3000 | Product management |
| Orders Service | http://localhost:3001 | Order administration |
| Inventory Service | http://localhost:3002 | Stock management |
| Group Commerce Service | http://localhost:3003 | Campaign oversight |
| Payments Service | http://localhost:3004 | Payment monitoring |
| Shipping Service | http://localhost:3005 | Fulfillment tracking |
| n8n Workflow Engine | http://localhost:5678 | Workflow management |
| Redpanda Console | http://localhost:8080 | Event stream monitoring |

### 2.2 Authentication
All admin access requires valid credentials. The n8n workflow engine uses basic authentication configured via environment variables:
- `N8N_BASIC_AUTH_USER` -- Admin username
- `N8N_BASIC_AUTH_PASSWORD` -- Admin password

API services will require JWT bearer tokens once the API Gateway authentication layer is deployed.

## 3. Platform Startup and Shutdown

### 3.1 Starting the Platform
To start all FusionCommerce services locally:
```bash
docker-compose up -d
```

Verify all containers are running:
```bash
docker-compose ps
```

Expected output should show healthy status for all 8 containers (Redpanda, 6 services, n8n).

### 3.2 Stopping the Platform
Graceful shutdown preserving data volumes:
```bash
docker-compose down
```

Full shutdown including data volumes (destroys all data):
```bash
docker-compose down -v
```

### 3.3 Restarting Individual Services
```bash
docker-compose restart catalog-service
docker-compose restart orders-service
```

## 4. Product Catalog Administration

### 4.1 Creating a Product
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD-001",
    "name": "Wireless Headphones",
    "description": "Premium noise-cancelling headphones",
    "price": 149.99,
    "currency": "USD",
    "inventory": 500
  }'
```

### 4.2 Listing All Products
```bash
curl http://localhost:3000/products
```

### 4.3 Product Validation Rules
- **sku**: Required, string, must be unique
- **name**: Required, string
- **price**: Required, number, must be >= 0
- **currency**: Required, string, 3 characters (USD, EUR, GBP, JPY)
- **inventory**: Required, integer, must be >= 0

## 5. Order Administration

### 5.1 Creating an Order
```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-001",
    "items": [
      { "sku": "PROD-001", "quantity": 2, "price": 149.99 }
    ],
    "currency": "USD"
  }'
```

### 5.2 Viewing Orders
```bash
curl http://localhost:3001/orders
```

### 5.3 Order Lifecycle States
Orders progress through these states:
1. **created** -- Order received, awaiting inventory check
2. **confirmed** -- Inventory reserved successfully
3. **failed** -- Inventory insufficient or processing error
4. **paid** -- Payment processed successfully
5. **shipped** -- Shipping label generated, package dispatched
6. **delivered** -- Package delivered to customer

## 6. Inventory Management

### 6.1 Checking Inventory Levels
```bash
curl http://localhost:3002/inventory
```

### 6.2 Updating Inventory
```bash
curl -X PUT http://localhost:3002/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD-001",
    "quantity": 1000
  }'
```

### 6.3 Automatic Inventory Events
The Inventory Service automatically subscribes to `order.created` events and:
- Reserves stock if available, publishing `inventory.reserved`
- Rejects if insufficient, publishing `inventory.insufficient`

## 7. Group Commerce Campaign Administration

### 7.1 Creating a Campaign
```bash
curl -X POST http://localhost:3003/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PROD-001",
    "minParticipants": 10,
    "maxParticipants": 50,
    "discountPercentage": 20,
    "expiresAt": "2026-03-01T00:00:00Z"
  }'
```

### 7.2 Monitoring Campaign Status
```bash
curl http://localhost:3003/campaigns
```

## 8. Event Stream Monitoring

### 8.1 Kafka Topics
Monitor events flowing through the platform via the Redpanda Console at http://localhost:8080.

Key topics to monitor:

| Topic | Publisher | Consumer |
|-------|-----------|----------|
| product.created | Catalog Service | n8n, Analytics |
| order.created | Orders Service | Inventory Service |
| inventory.reserved | Inventory Service | Payments Service, n8n |
| inventory.insufficient | Inventory Service | Orders Service, n8n |
| payment.created | Payments Service | n8n |
| payment.succeeded | Payments Service | Shipping Service |
| payment.failed | Payments Service | Orders Service |
| shipping.label.created | Shipping Service | n8n |

### 8.2 Consumer Group Lag
Monitor consumer group lag to detect processing delays. Lag > 1000 messages on any topic warrants investigation.

## 9. Workflow Administration (n8n)

### 9.1 Accessing n8n
Navigate to http://localhost:5678 and log in with the configured basic auth credentials.

### 9.2 Workflow Management
n8n provides a visual workflow builder for orchestrating multi-step business processes. Common workflows include:
- **Order Confirmation Email** -- Triggered by `order.created` event
- **Inventory Alert** -- Triggered when stock falls below threshold
- **Campaign Success Notification** -- Triggered by `group-commerce.campaign.successful`
- **Shipping Update** -- Triggered by `shipping.label.created`

### 9.3 Creating a New Workflow
1. Click "New Workflow" in the n8n dashboard
2. Add a Kafka trigger node configured for the desired topic
3. Add processing nodes (HTTP Request, Function, IF, etc.)
4. Connect nodes to define the execution flow
5. Activate the workflow

## 10. Health Monitoring

### 10.1 Service Health Checks
Each service exposes a `/health` endpoint:
```bash
curl http://localhost:3000/health  # Catalog
curl http://localhost:3001/health  # Orders
curl http://localhost:3002/health  # Inventory
curl http://localhost:3003/health  # Group Commerce
curl http://localhost:3004/health  # Payments
curl http://localhost:3005/health  # Shipping
```

### 10.2 Container Health
```bash
docker-compose ps
docker stats
```

### 10.3 Log Access
View real-time logs for any service:
```bash
docker-compose logs -f catalog-service
docker-compose logs -f orders-service
docker-compose logs --tail=100 inventory-service
```

## 11. Database Administration

### 11.1 Running Migrations
Migrations are managed via Knex. To run pending migrations:
```bash
docker-compose exec orders-service npx knex migrate:latest
docker-compose exec inventory-service npx knex migrate:latest
```

### 11.2 Database Connection
Connect to PostgreSQL directly:
```bash
psql postgresql://postgres:postgres@localhost:5432/ecommerce
```

### 11.3 Backup Procedures
```bash
pg_dump -h localhost -U postgres -d ecommerce > backup_$(date +%Y%m%d).sql
```

## 12. Troubleshooting

### 12.1 Service Not Starting
1. Check container logs: `docker-compose logs <service-name>`
2. Verify environment variables in docker-compose.yml
3. Ensure dependent services (Redpanda, PostgreSQL) are healthy
4. Check port conflicts with `lsof -i :<port>`

### 12.2 Events Not Processing
1. Verify Redpanda is healthy: `curl http://localhost:8080`
2. Check consumer group status in Redpanda Console
3. Verify topic exists and has partitions assigned
4. Review service logs for connection errors

### 12.3 Database Connection Failures
1. Verify PostgreSQL is running: `docker-compose ps`
2. Check DATABASE_URL environment variable
3. Test connection: `psql $DATABASE_URL -c "SELECT 1"`
4. Verify connection pool is not exhausted (max 10 per service)

### 12.4 Common Error Codes

| HTTP Code | Meaning | Action |
|-----------|---------|--------|
| 400 | Validation error | Check request body against JSON schema |
| 404 | Resource not found | Verify resource ID and service endpoint |
| 500 | Internal server error | Check service logs for stack trace |
| 503 | Service unavailable | Service starting up or dependency failure |
