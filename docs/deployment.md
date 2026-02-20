# Deployment Guide — eCommerce Platform
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Introduction

### 1.1 Purpose
This guide provides step-by-step instructions for deploying the FusionCommerce eCommerce Platform across development, staging, and production environments. It covers Docker Compose local deployment, Kubernetes production deployment, CI/CD pipeline configuration, and operational procedures.

### 1.2 Scope
All microservices (Catalog, Orders, Inventory, Group Commerce, Payments, Shipping), infrastructure components (Redpanda, PostgreSQL, n8n), and supporting tooling.

## 2. Deployment Environments

### 2.1 Environment Matrix

| Environment | Purpose | Infrastructure | Deployment Method |
|-------------|---------|---------------|-------------------|
| Development | Local development and debugging | Docker Compose | Manual / npm scripts |
| Staging | Integration testing and QA | Kubernetes cluster | CI/CD automated |
| Production | Live customer traffic | Kubernetes cluster (HA) | CI/CD with manual approval |

### 2.2 Environment Configuration

| Variable | Development | Staging | Production |
|----------|------------|---------|------------|
| NODE_ENV | development | staging | production |
| LOG_LEVEL | debug | info | warn |
| DATABASE_URL | postgresql://postgres:postgres@localhost:5432/ecommerce | (secret) | (secret) |
| KAFKA_BROKERS | localhost:9092 | redpanda-staging:9092 | redpanda-prod:9092 |
| N8N_BASIC_AUTH_USER | admin | (secret) | (secret) |
| N8N_BASIC_AUTH_PASSWORD | changeme | (secret) | (secret) |

## 3. Development Deployment (Docker Compose)

### 3.1 Prerequisites
- Docker Desktop 4.x with 8 GB+ RAM allocated
- Node.js 18 LTS+ and npm 9+
- Git

### 3.2 Step-by-Step Deployment

**Step 1: Clone the repository**
```bash
git clone https://github.com/fusioncommerce/fusioncommerce.git
cd fusioncommerce
```

**Step 2: Install dependencies**
```bash
npm install
```

**Step 3: Start infrastructure**
```bash
docker-compose up -d
```

**Step 4: Verify infrastructure**
```bash
docker-compose ps
# All containers should show "healthy" or "running"
```

**Step 5: Run database migrations**
```bash
cd services/orders && npx knex migrate:latest && cd ../..
cd services/inventory && npx knex migrate:latest && cd ../..
cd services/group-commerce && npx knex migrate:latest && cd ../..
```

**Step 6: Start services**
Option A -- All services via Docker Compose:
```bash
docker-compose --profile services up -d
```

Option B -- Individual services in dev mode (with hot reload):
```bash
cd services/catalog && npm run dev
cd services/orders && npm run dev
cd services/inventory && npm run dev
cd services/group-commerce && npm run dev
```

**Step 7: Verify services**
```bash
curl http://localhost:3000/health  # Catalog
curl http://localhost:3001/health  # Orders
curl http://localhost:3002/health  # Inventory
curl http://localhost:3003/health  # Group Commerce
```

### 3.3 Docker Compose Service Map

| Service | Image | Ports | Depends On |
|---------|-------|-------|------------|
| redpanda | redpanda/redpanda | 9092, 19092, 8080 | -- |
| postgres | postgres:15 | 5432 | -- |
| n8n | n8nio/n8n:1.70.1 | 5678 | postgres |
| catalog-service | fusioncommerce/catalog | 3000 | redpanda |
| orders-service | fusioncommerce/orders | 3001 | redpanda, postgres |
| inventory-service | fusioncommerce/inventory | 3002 | redpanda, postgres |
| group-commerce-service | fusioncommerce/group-commerce | 3003 | redpanda, postgres |
| payments-service | fusioncommerce/payments | 3004 | redpanda, postgres |
| shipping-service | fusioncommerce/shipping | 3005 | redpanda, postgres |

### 3.4 Shutting Down

Preserve data:
```bash
docker-compose down
```

Destroy all data:
```bash
docker-compose down -v
```

## 4. Building Docker Images

### 4.1 Individual Service Build
```bash
docker build -t fusioncommerce/catalog:latest -f services/catalog/Dockerfile .
docker build -t fusioncommerce/orders:latest -f services/orders/Dockerfile .
docker build -t fusioncommerce/inventory:latest -f services/inventory/Dockerfile .
docker build -t fusioncommerce/group-commerce:latest -f services/group-commerce/Dockerfile .
```

### 4.2 Multi-Service Build
```bash
docker-compose build
```

### 4.3 Image Tagging Strategy

| Environment | Tag Format | Example |
|-------------|-----------|---------|
| Development | :latest | fusioncommerce/orders:latest |
| Staging | :sha-{commit} | fusioncommerce/orders:sha-abc1234 |
| Production | :v{semver} | fusioncommerce/orders:v1.0.0 |

### 4.4 Publishing to Registry
```bash
docker tag fusioncommerce/orders:latest registry.example.com/fusioncommerce/orders:v1.0.0
docker push registry.example.com/fusioncommerce/orders:v1.0.0
```

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Pipeline
The CI/CD pipeline is defined in `.github/workflows/ci.yml` and runs on every push and pull request:

```
Push to Branch
     |
     v
[Lint] -> [Build] -> [Test] -> [Docker Build]
     |                              |
     v                              v
[PR Merge to main]          [Push Image to Registry]
     |
     v
[Deploy to Staging] -> [Integration Tests] -> [Manual Approval] -> [Deploy to Production]
```

### 5.2 Pipeline Stages

| Stage | Trigger | Actions | Duration |
|-------|---------|---------|----------|
| Lint | Push/PR | ESLint checks | ~1 min |
| Build | Push/PR | TypeScript compilation | ~2 min |
| Test | Push/PR | Jest unit tests | ~3 min |
| Docker Build | Push/PR | Build all service images | ~5 min |
| Staging Deploy | Merge to main | Deploy to staging K8s | ~5 min |
| Integration Test | Post-staging deploy | Run integration suite | ~10 min |
| Production Deploy | Manual approval | Deploy to production K8s | ~5 min |

### 5.3 Quality Gates
Deployment is blocked if any of these fail:
- ESLint: Zero errors
- TypeScript: Zero compilation errors
- Unit Tests: All pass with 80%+ coverage
- Docker Build: All images build successfully
- Security Scan: No critical vulnerabilities

## 6. Kubernetes Deployment (Staging/Production)

### 6.1 Cluster Requirements

| Component | Staging | Production |
|-----------|---------|------------|
| Control Plane Nodes | 1 | 3 (HA) |
| Worker Nodes | 3 | 6+ |
| CPU per Worker | 4 vCPU | 8 vCPU |
| RAM per Worker | 16 GB | 32 GB |
| Storage per Worker | 200 GB SSD | 500 GB NVMe SSD |

### 6.2 Namespace Structure
```
fusioncommerce-staging/
  catalog-service
  orders-service
  inventory-service
  group-commerce-service
  payments-service
  shipping-service
  redpanda
  postgresql
  n8n

fusioncommerce-production/
  (same services with production configuration)
```

### 6.3 Kubernetes Resource Configuration

#### Service Deployment Template
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-service
  namespace: fusioncommerce-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: orders-service
  template:
    metadata:
      labels:
        app: orders-service
    spec:
      containers:
      - name: orders-service
        image: registry.example.com/fusioncommerce/orders:v1.0.0
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: orders-url
        - name: KAFKA_BROKERS
          value: "redpanda:9092"
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Horizontal Pod Autoscaler
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: orders-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: orders-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 6.4 Service Scaling Targets

| Service | Min Replicas | Max Replicas | CPU Target |
|---------|-------------|-------------|------------|
| Catalog | 2 | 8 | 70% |
| Orders | 2 | 10 | 70% |
| Inventory | 2 | 10 | 70% |
| Group Commerce | 1 | 5 | 70% |
| Payments | 2 | 8 | 60% |
| Shipping | 1 | 5 | 70% |

## 7. Database Deployment

### 7.1 Migration Strategy
Migrations must run before the new application version starts serving traffic:

```bash
# Run migrations as a Kubernetes Job
kubectl create job migrate-orders --image=fusioncommerce/orders:v1.0.0 \
  -- npx knex migrate:latest
```

### 7.2 Migration Safety Rules
- Always test migrations on staging before production
- Migrations must be backward-compatible (no column drops without a two-phase approach)
- Keep migration execution time under 60 seconds
- Always verify with `knex migrate:status` after execution

### 7.3 Backup Before Migration
```bash
pg_dump -h $DB_HOST -U $DB_USER -d ecommerce > pre_migration_$(date +%Y%m%d_%H%M%S).sql
```

## 8. Secrets Management

### 8.1 Required Secrets

| Secret | Services | Description |
|--------|----------|-------------|
| DATABASE_URL | Orders, Inventory, Group Commerce | PostgreSQL connection string |
| KAFKA_BROKERS | All services | Redpanda broker addresses |
| STRIPE_SECRET_KEY | Payments | Stripe API key |
| STRIPE_WEBHOOK_SECRET | Payments | Stripe webhook signing secret |
| N8N_BASIC_AUTH_USER | n8n | Admin username |
| N8N_BASIC_AUTH_PASSWORD | n8n | Admin password |

### 8.2 Kubernetes Secret Creation
```bash
kubectl create secret generic db-credentials \
  --from-literal=orders-url='postgresql://user:pass@host:5432/ecommerce' \
  --namespace=fusioncommerce-production
```

### 8.3 Secret Rotation
- Database passwords: Rotate every 90 days
- API keys: Rotate every 180 days
- Use zero-downtime rotation (update secret, rolling restart)

## 9. Monitoring and Health Checks

### 9.1 Health Check Configuration
Every service exposes `/health` for both liveness and readiness probes:
- **Liveness**: Detects crashed services for automatic restart
- **Readiness**: Detects services not yet ready to serve traffic

### 9.2 Post-Deployment Verification
After every deployment, verify:
1. All pods are in Running state: `kubectl get pods -n fusioncommerce-production`
2. Health endpoints respond: `curl http://<service>/health`
3. Kafka consumer groups are active: Check Redpanda Console
4. Recent orders process successfully: Create a test order
5. No error spikes in logs: `kubectl logs -l app=orders-service --tail=50`

## 10. Rollback Procedures

### 10.1 Quick Rollback
Roll back to the previous deployment revision:
```bash
kubectl rollout undo deployment/orders-service -n fusioncommerce-production
```

### 10.2 Targeted Rollback
Roll back to a specific revision:
```bash
kubectl rollout history deployment/orders-service -n fusioncommerce-production
kubectl rollout undo deployment/orders-service --to-revision=3 -n fusioncommerce-production
```

### 10.3 Database Rollback
If the deployment included a migration:
```bash
# Rollback the latest migration batch
kubectl exec -it orders-service-pod -- npx knex migrate:rollback
# Or restore from backup
psql -h $DB_HOST -U $DB_USER -d ecommerce < pre_migration_backup.sql
```

### 10.4 Rollback Decision Criteria
Initiate rollback if any of the following occur within 30 minutes post-deploy:
- Error rate exceeds 1% of requests
- p95 latency exceeds 2x the pre-deployment baseline
- Health check failures on 2+ pods
- Kafka consumer lag exceeds 5000 messages
- Data integrity issues detected

## 11. Deployment Checklist

### 11.1 Pre-Deployment
- [ ] All CI pipeline stages pass
- [ ] Database migrations tested on staging
- [ ] Secrets updated if required
- [ ] Release notes documented
- [ ] Rollback plan reviewed

### 11.2 Deployment
- [ ] Database backup completed
- [ ] Migrations executed successfully
- [ ] Application deployment initiated
- [ ] Rolling update progressing (no CrashLoopBackOff)
- [ ] All pods in Ready state

### 11.3 Post-Deployment
- [ ] Health checks pass on all services
- [ ] Smoke test: create product, create order, verify event flow
- [ ] Kafka consumer groups are healthy
- [ ] No error spikes in logs
- [ ] Monitoring dashboards show normal metrics
- [ ] Stakeholders notified of successful deployment
