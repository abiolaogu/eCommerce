# Training Manual: Administrator — eCommerce Platform
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Introduction

### 1.1 Training Objectives
Upon completing this training, administrators will be able to:
- Deploy and manage the FusionCommerce platform using Docker Compose
- Monitor service health, event streams, and database operations
- Administer the product catalog, orders, inventory, and campaigns
- Configure and manage n8n workflows for business automation
- Troubleshoot common operational issues
- Perform backup and recovery procedures

### 1.2 Training Duration
Estimated total training time: 16 hours across 4 modules.

### 1.3 Prerequisites
- Completed onboarding for the FusionCommerce project
- Docker Desktop installed and configured with 8+ GB RAM
- Terminal/command-line proficiency
- Basic understanding of REST APIs, JSON, and databases

## 2. Module 1: Platform Architecture Overview (2 hours)

### 2.1 Learning Objectives
- Understand the microservices architecture of FusionCommerce
- Identify the six services and their responsibilities
- Understand event-driven communication through Kafka

### 2.2 Architecture Diagram Review
FusionCommerce consists of six microservices communicating through an Apache Kafka (Redpanda) event bus:

| Service | Port | Responsibility |
|---------|------|---------------|
| Catalog | 3000 | Product information management |
| Orders | 3001 | Order lifecycle management |
| Inventory | 3002 | Stock tracking and reservation |
| Group Commerce | 3003 | Social group buying campaigns |
| Payments | 3004 | Payment processing (Stripe) |
| Shipping | 3005 | Fulfillment and shipping labels |

### 2.3 Event Flow Walkthrough
Follow the lifecycle of an order through the system:
1. Customer creates an order via Orders Service
2. `order.created` event published to Kafka
3. Inventory Service consumes event and checks stock
4. `inventory.reserved` or `inventory.insufficient` event published
5. Payments Service initiates payment collection
6. `payment.succeeded` event triggers shipment creation
7. Shipping Service generates label and publishes `shipping.label.created`

### 2.4 Hands-On Exercise: Trace an Event
1. Start the platform: `docker-compose up -d`
2. Create a product via the Catalog API
3. Open Redpanda Console at http://localhost:8080
4. Observe the `product.created` event in the topic
5. Create an order referencing that product
6. Trace the event chain through topics

### 2.5 Knowledge Check
- Q1: What port does the Inventory Service run on?
- Q2: Which event does the Inventory Service subscribe to?
- Q3: What happens when inventory is insufficient for an order?

## 3. Module 2: Day-to-Day Operations (4 hours)

### 3.1 Learning Objectives
- Start, stop, and restart the platform and individual services
- Manage products, orders, and inventory through the API
- Monitor service health and container status
- Access and interpret service logs

### 3.2 Platform Lifecycle Management

#### Starting the Platform
```bash
docker-compose up -d
docker-compose ps  # Verify all containers are healthy
```

#### Stopping the Platform
```bash
docker-compose down     # Preserve data
docker-compose down -v  # Destroy data (use with caution)
```

#### Restarting a Single Service
```bash
docker-compose restart orders-service
```

### 3.3 Product Administration Exercise
Step-by-step exercise for catalog management:

**Step 1: Create a product**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"TRAIN-001","name":"Training Widget","description":"Test product","price":25.00,"currency":"USD","inventory":100}'
```

**Step 2: Verify the product was created**
```bash
curl http://localhost:3000/products | python3 -m json.tool
```

**Step 3: Verify the Kafka event**
Open http://localhost:8080 and navigate to the `product.created` topic.

### 3.4 Order Management Exercise
**Step 1: Create an order**
```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"CUST-TRAIN-001","items":[{"sku":"TRAIN-001","quantity":2,"price":25.00}],"currency":"USD"}'
```

**Step 2: List orders**
```bash
curl http://localhost:3001/orders | python3 -m json.tool
```

**Step 3: Check inventory impact**
```bash
curl http://localhost:3002/inventory | python3 -m json.tool
```

### 3.5 Health Monitoring Exercise
Write a shell script that checks all service health endpoints:
```bash
for port in 3000 3001 3002 3003 3004 3005; do
  echo "Service on port $port:"
  curl -s http://localhost:$port/health | python3 -m json.tool
  echo "---"
done
```

### 3.6 Log Analysis Exercise
1. Start tailing logs: `docker-compose logs -f orders-service`
2. Create an order in another terminal
3. Observe the log output and identify key fields (reqId, orderId, level)
4. Practice filtering logs: `docker-compose logs orders-service | grep ERROR`

### 3.7 Knowledge Check
- Q1: What command gracefully stops the platform without deleting data?
- Q2: How do you check if all services are healthy?
- Q3: Where do you find real-time service logs?

## 4. Module 3: Workflow Administration with n8n (4 hours)

### 4.1 Learning Objectives
- Access and navigate the n8n workflow interface
- Create automated workflows triggered by Kafka events
- Configure notification workflows for order and inventory events
- Test and debug workflows

### 4.2 Accessing n8n
1. Navigate to http://localhost:5678
2. Log in with the credentials from your environment configuration
3. Familiarize yourself with the workflow canvas

### 4.3 Exercise: Order Notification Workflow
Build a workflow that sends a notification when a new order is created:

**Step 1: Add Kafka Trigger**
- Node type: Kafka Trigger
- Topic: `order.created`
- Broker: `redpanda:9092`

**Step 2: Add Function Node**
- Parse the event payload
- Extract order ID, customer ID, and total

**Step 3: Add HTTP Request Node**
- Configure to call your notification service or webhook

**Step 4: Test the Workflow**
- Activate the workflow
- Create a test order via the Orders API
- Verify the notification was triggered

### 4.4 Exercise: Inventory Alert Workflow
Build a workflow that alerts when inventory falls below a threshold:

**Step 1: Add Kafka Trigger** for `inventory.reserved`
**Step 2: Add Function Node** to check remaining quantity
**Step 3: Add IF Node** to filter for low-stock conditions (< 10 units)
**Step 4: Add notification action** for low-stock alerts

### 4.5 Workflow Best Practices
- Always name workflows descriptively
- Add error handling nodes for failure scenarios
- Test workflows in inactive mode before activation
- Document workflow purpose in the workflow description field
- Use sub-workflows for reusable logic

### 4.6 Knowledge Check
- Q1: What is the default n8n port?
- Q2: How do you configure a Kafka trigger in n8n?
- Q3: What is the recommended approach before activating a new workflow?

## 5. Module 4: Troubleshooting and Recovery (6 hours)

### 5.1 Learning Objectives
- Diagnose and resolve common platform issues
- Perform database backup and recovery
- Handle Kafka consumer lag and event processing delays
- Execute disaster recovery procedures

### 5.2 Troubleshooting Scenarios

#### Scenario 1: Service Will Not Start
**Symptoms**: Container exits immediately or enters restart loop
**Diagnostic Steps**:
1. Check container logs: `docker-compose logs <service-name>`
2. Verify environment variables in docker-compose.yml
3. Check if the required port is already in use
4. Verify dependent services are running

**Practice**: Intentionally misconfigure DATABASE_URL and observe the error. Then fix it.

#### Scenario 2: Events Not Being Processed
**Symptoms**: Orders created but inventory not reserved
**Diagnostic Steps**:
1. Verify Redpanda is running: `docker-compose ps redpanda`
2. Check the Redpanda Console for topic health
3. Review consumer group lag
4. Check Inventory Service logs for connection errors

**Practice**: Stop Redpanda, create an order, restart Redpanda, and observe event recovery.

#### Scenario 3: Database Connection Failure
**Symptoms**: 500 errors on order creation or listing
**Diagnostic Steps**:
1. Verify PostgreSQL container: `docker-compose ps`
2. Test connection: `psql $DATABASE_URL -c "SELECT 1"`
3. Check connection pool exhaustion
4. Review service logs for pool timeout errors

### 5.3 Database Backup and Recovery

**Backup Exercise**:
```bash
pg_dump -h localhost -U postgres -d ecommerce > backup_training.sql
```

**Recovery Exercise**:
```bash
psql -h localhost -U postgres -d ecommerce < backup_training.sql
```

**Verify Recovery**:
```bash
curl http://localhost:3001/orders | python3 -m json.tool
```

### 5.4 Performance Monitoring
1. Use `docker stats` to monitor container resource usage
2. Identify memory-intensive and CPU-intensive containers
3. Understand Redpanda consumer lag metrics
4. Practice identifying bottlenecks through log analysis

### 5.5 Knowledge Check
- Q1: What is the first thing to check when a service will not start?
- Q2: How do you verify Kafka connectivity?
- Q3: What command creates a PostgreSQL backup?

## 6. Assessment

### 6.1 Practical Assessment
Complete the following tasks without referring to the manual:
1. Start the FusionCommerce platform from scratch
2. Create 3 products with different SKUs
3. Create 2 orders referencing those products
4. Verify inventory was updated via the event chain
5. Create an n8n workflow triggered by `order.created`
6. Perform a database backup
7. Restart the Orders Service without affecting other services
8. Troubleshoot a simulated service failure (instructor-provided)

### 6.2 Passing Criteria
- All 8 tasks completed successfully
- Demonstrates understanding of event flow
- Can explain troubleshooting steps taken
- Minimum score: 80%

## 7. Additional Resources
- Platform architecture documentation: `docs/architecture.md`
- API reference: `docs/technical-specifications.md`
- Workflow documentation: `docs/workflows.md`
- Hardware requirements: `docs/hardware-requirements.md`
- Redpanda documentation: https://docs.redpanda.com
- n8n documentation: https://docs.n8n.io
