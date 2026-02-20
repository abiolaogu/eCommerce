# Training Video Scripts — eCommerce Platform
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Introduction

### 1.1 Purpose
This document contains the scripts for all FusionCommerce training videos. Each script includes narration text, on-screen actions, and visual cues for video production.

### 1.2 Video Standards
- Duration: 5-15 minutes per video
- Format: Screen recording with voiceover narration
- Resolution: 1920x1080 minimum
- Audio: Clear narration with background music at low volume
- Captions: Required for all videos

---

## 2. Video 1: Platform Overview (8 minutes)

### Title: "FusionCommerce Platform Overview"
### Audience: All Users

**[INTRO - 0:00 to 0:30]**

NARRATOR: "Welcome to FusionCommerce, a composable, event-driven eCommerce platform designed for modern commerce experiences. In this video, we will walk through the platform architecture, key features, and how the different components work together."

ON-SCREEN: FusionCommerce logo animation, then transition to architecture diagram.

**[ARCHITECTURE - 0:30 to 2:30]**

NARRATOR: "FusionCommerce is built as a collection of six microservices, each responsible for a specific business capability. Let us look at each one."

ON-SCREEN: Highlight each service on the architecture diagram as it is mentioned.

NARRATOR: "The Catalog Service on port 3000 manages product information -- names, prices, descriptions, and inventory levels. The Orders Service on port 3001 handles the complete order lifecycle from creation to delivery. The Inventory Service on port 3002 automatically tracks and reserves stock when orders come in."

ON-SCREEN: Animate event flow arrows between services.

NARRATOR: "The Group Commerce Service on port 3003 powers social group buying campaigns. The Payments Service on port 3004 processes payments through Stripe. And the Shipping Service on port 3005 generates shipping labels and provides tracking."

NARRATOR: "These services communicate through Apache Kafka -- an event streaming platform -- represented here by Redpanda. When something happens in one service, it publishes an event that other services can react to."

**[EVENT FLOW DEMO - 2:30 to 5:00]**

NARRATOR: "Let me show you a real example. When a customer places an order, the Orders Service publishes an order-dot-created event to Kafka."

ON-SCREEN: Show terminal creating an order via curl, then switch to Redpanda Console showing the event.

NARRATOR: "The Inventory Service is listening for this event. It automatically checks if there is enough stock and either reserves the inventory or reports that stock is insufficient."

ON-SCREEN: Show the inventory.reserved event appearing in the Redpanda Console.

NARRATOR: "This event-driven approach means services are loosely coupled. They do not call each other directly, making the system more resilient and scalable."

**[WORKFLOW ENGINE - 5:00 to 6:30]**

NARRATOR: "FusionCommerce also includes n8n, a visual workflow engine that business analysts can use to orchestrate multi-step processes without writing code."

ON-SCREEN: Show the n8n dashboard at localhost:5678.

NARRATOR: "For example, you could create a workflow that sends an email when an order is created, alerts the warehouse team when inventory is low, or notifies customers when their package ships."

**[CLOSING - 6:30 to 8:00]**

NARRATOR: "FusionCommerce is designed to be composable. You can deploy only the services you need, scale them independently, and add new services without disrupting existing ones. In the next video, we will show you how to set up the development environment."

ON-SCREEN: Summary slide with links to documentation.

---

## 3. Video 2: Developer Setup (12 minutes)

### Title: "Setting Up Your FusionCommerce Development Environment"
### Audience: Developers

**[INTRO - 0:00 to 0:30]**

NARRATOR: "In this video, we will set up the FusionCommerce development environment from scratch. By the end, you will have all six services running locally with Kafka and PostgreSQL."

**[PREREQUISITES - 0:30 to 1:30]**

NARRATOR: "Before we begin, make sure you have Node.js 18 or later, npm 9 or later, Docker Desktop with at least 8 gigabytes of RAM allocated, and Git installed."

ON-SCREEN: Show terminal running `node --version`, `npm --version`, `docker --version`, `git --version`.

**[CLONE AND INSTALL - 1:30 to 3:30]**

NARRATOR: "First, clone the repository."

ON-SCREEN: Terminal showing:
```bash
git clone https://github.com/fusioncommerce/fusioncommerce.git
cd fusioncommerce
```

NARRATOR: "Now install all dependencies. FusionCommerce uses npm workspaces, so a single install command at the root handles all packages and services."

ON-SCREEN: Terminal showing `npm install` with output.

NARRATOR: "Notice how it installs dependencies for the packages directory -- contracts, event-bus, and database -- as well as all six services."

**[START INFRASTRUCTURE - 3:30 to 5:30]**

NARRATOR: "Next, start the infrastructure containers using Docker Compose."

ON-SCREEN: Terminal showing:
```bash
docker-compose up -d
docker-compose ps
```

NARRATOR: "Docker Compose starts Redpanda for event streaming, PostgreSQL for data persistence, and n8n for workflow automation. Let us verify everything is healthy."

ON-SCREEN: Show all containers with healthy status.

**[RUN MIGRATIONS - 5:30 to 7:00]**

NARRATOR: "Now we need to run database migrations for the services that use PostgreSQL."

ON-SCREEN: Terminal showing migration commands for orders, inventory, and group-commerce services.

NARRATOR: "These migrations create the tables our services need. The Catalog Service currently uses in-memory storage, so it does not need migrations."

**[START SERVICES - 7:00 to 9:00]**

NARRATOR: "Let us start the services. Open a terminal for each one."

ON-SCREEN: Split terminal view showing four services starting up.

NARRATOR: "Each service starts a Fastify HTTP server on its designated port and connects to the Kafka event bus."

**[VERIFY - 9:00 to 10:30]**

NARRATOR: "Let us verify everything is working by hitting the health endpoints."

ON-SCREEN: Terminal showing curl commands to each /health endpoint.

NARRATOR: "All services return status OK. Now let us create a product and trace the event."

ON-SCREEN: Terminal showing product creation and then Redpanda Console showing the event.

**[CLOSING - 10:30 to 12:00]**

NARRATOR: "Your development environment is ready. You can now make changes to any service, and the event-driven architecture will keep everything in sync. Check the developer user manual for coding conventions and contribution guidelines."

---

## 4. Video 3: Admin Operations (10 minutes)

### Title: "Day-to-Day Platform Administration"
### Audience: Administrators

**[INTRO - 0:00 to 0:30]**

NARRATOR: "This video covers the daily operations tasks for FusionCommerce platform administrators. We will cover starting and stopping the platform, managing products and orders, and monitoring system health."

**[PLATFORM LIFECYCLE - 0:30 to 2:30]**

NARRATOR: "Starting the platform is straightforward with Docker Compose."

ON-SCREEN: Show `docker-compose up -d` and `docker-compose ps`.

NARRATOR: "To stop the platform while preserving data, use docker-compose down. If you need a clean slate, add the dash-v flag to remove data volumes -- but be careful, this destroys all data."

ON-SCREEN: Show both commands.

NARRATOR: "You can also restart individual services without affecting others."

ON-SCREEN: Show `docker-compose restart catalog-service`.

**[PRODUCT MANAGEMENT - 2:30 to 4:30]**

NARRATOR: "Let us create a product and see it appear in the catalog."

ON-SCREEN: Show curl command creating a product, then listing all products.

NARRATOR: "Notice the product gets a unique UUID. The system validates all fields -- try sending a negative price and you will get a 400 error."

ON-SCREEN: Demonstrate a validation error.

**[ORDER MANAGEMENT - 4:30 to 6:30]**

NARRATOR: "Creating an order triggers the full event chain."

ON-SCREEN: Show order creation, then switch to Redpanda Console to show event flow.

NARRATOR: "Watch how the order-dot-created event flows through the system. The Inventory Service picks it up and either reserves stock or reports insufficient inventory."

**[HEALTH MONITORING - 6:30 to 8:30]**

NARRATOR: "Regular health monitoring is essential. Each service exposes a health endpoint."

ON-SCREEN: Show health check script running against all services.

NARRATOR: "For deeper monitoring, use docker stats to view resource usage, and docker-compose logs to access service logs."

ON-SCREEN: Show `docker stats` and `docker-compose logs -f orders-service`.

**[TROUBLESHOOTING - 8:30 to 10:00]**

NARRATOR: "If a service is not responding, start by checking its logs. Most issues come from missing environment variables, port conflicts, or infrastructure dependencies not being ready."

ON-SCREEN: Show troubleshooting flow with log examples.

---

## 5. Video 4: Shopping Experience (8 minutes)

### Title: "Shopping on FusionCommerce"
### Audience: End Users

**[INTRO - 0:00 to 0:30]**

NARRATOR: "Welcome to FusionCommerce! In this video, we will walk you through the complete shopping experience -- from finding products to tracking your delivery."

**[BROWSING - 0:30 to 2:00]**

NARRATOR: "The FusionCommerce storefront makes it easy to find what you are looking for. You can browse by category, use the search bar for specific items, or apply filters to narrow down your options."

ON-SCREEN: Show storefront mockup with category navigation, search, and filters.

NARRATOR: "Click on any product to see full details, including images, description, available variants, and customer reviews."

**[CART AND CHECKOUT - 2:00 to 4:30]**

NARRATOR: "Found something you like? Select your options, set the quantity, and click Add to Cart."

ON-SCREEN: Show add-to-cart flow.

NARRATOR: "When you are ready, click the cart icon to review your items. You can update quantities, remove items, or apply a coupon code here."

NARRATOR: "Checkout is a simple four-step process. First, confirm your shipping address and select a shipping method. Second, choose your payment method. Third, review everything. And fourth, click Place Order."

ON-SCREEN: Walk through each checkout step with mockups.

**[GROUP BUYING - 4:30 to 6:30]**

NARRATOR: "One of FusionCommerce's unique features is group buying. Visit the Group Deals page to find campaigns where you can get discounts by purchasing together with other shoppers."

ON-SCREEN: Show group deals page with active campaigns.

NARRATOR: "Join a campaign, share it with friends, and if enough people participate before the deadline, everyone gets the group discount."

**[ORDER TRACKING - 6:30 to 8:00]**

NARRATOR: "After placing your order, visit My Orders to track its progress. You will see status updates as your order moves from Created to Confirmed, Paid, Shipped, and finally Delivered."

ON-SCREEN: Show order status timeline.

NARRATOR: "Once shipped, click Track Shipment for real-time tracking with carrier information and estimated delivery. Thank you for shopping with FusionCommerce!"

---

## 6. Video 5: Building a New Service (15 minutes)

### Title: "Building a New Microservice in FusionCommerce"
### Audience: Developers

**[INTRO - 0:00 to 0:30]**

NARRATOR: "In this advanced video, we will build a new microservice from scratch following the FusionCommerce patterns. We will create a Reviews Service that lets customers review products."

**[SCAFFOLD - 0:30 to 3:00]**

NARRATOR: "Start by creating the service directory under services."

ON-SCREEN: Show creating directory structure, package.json, tsconfig.json.

**[TYPES AND CONTRACTS - 3:00 to 5:00]**

NARRATOR: "Define your domain types and event contracts first."

ON-SCREEN: Show creating types.ts and adding event to contracts package.

**[REPOSITORY - 5:00 to 8:00]**

NARRATOR: "Implement the repository layer with both InMemory and Postgres implementations."

ON-SCREEN: Show creating the repository interface, InMemory implementation, and Postgres implementation.

**[SERVICE LAYER - 8:00 to 10:00]**

NARRATOR: "The service layer contains the business logic."

ON-SCREEN: Show creating the service class with create and list methods.

**[APP AND ROUTES - 10:00 to 12:00]**

NARRATOR: "Wire everything together in the app builder."

ON-SCREEN: Show creating app.ts with routes and the index.ts entry point.

**[TESTS - 12:00 to 14:00]**

NARRATOR: "Write unit tests using the InMemory implementations."

ON-SCREEN: Show test file with describe/it blocks.

**[CLOSING - 14:00 to 15:00]**

NARRATOR: "That is the complete pattern. Every FusionCommerce service follows this structure. Consistency makes the codebase easier to understand and maintain across teams."

---

## 7. Video Production Checklist

| Item | Requirement |
|------|------------|
| Screen recording software | OBS Studio or Camtasia |
| Resolution | 1920x1080 minimum |
| Frame rate | 30 fps |
| Audio | External microphone, noise-free environment |
| Terminal font size | 16pt minimum for readability |
| Captions | Auto-generated and manually reviewed |
| Intro/outro | Standard FusionCommerce branding |
| Background music | Royalty-free, low volume |
| Review | Technical review before publication |

## 8. Distribution

| Channel | Format | Notes |
|---------|--------|-------|
| Internal LMS | MP4 (H.264) | Primary distribution for employees |
| YouTube (Private) | MP4 (H.264) | Unlisted links for external partners |
| Documentation Site | Embedded | Linked from relevant doc pages |
| Onboarding Portal | Streaming | Part of new hire onboarding flow |
