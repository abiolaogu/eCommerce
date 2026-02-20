# Figma/Make Design Prompts — eCommerce Platform
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Introduction

### 1.1 Purpose
This document provides AI-ready design prompts for generating FusionCommerce UI mockups in Figma (or similar design tools) and automation workflows in Make (formerly Integromat). Each prompt is structured to produce consistent, brand-aligned outputs that match the FusionCommerce design system.

### 1.2 Design System Foundation

| Element | Specification |
|---------|--------------|
| Primary Color | #2563EB (Blue 600) |
| Secondary Color | #7C3AED (Violet 600) |
| Success Color | #059669 (Emerald 600) |
| Error Color | #DC2626 (Red 600) |
| Warning Color | #D97706 (Amber 600) |
| Background | #FFFFFF (Light) / #111827 (Dark) |
| Font Family | Inter for UI, JetBrains Mono for code |
| Border Radius | 8px (cards), 6px (buttons), 4px (inputs) |
| Spacing Scale | 4px base unit (4, 8, 12, 16, 24, 32, 48, 64) |

## 2. Figma Design Prompts: Storefront UI

### 2.1 Home Page
**Prompt**: "Design a modern eCommerce homepage for FusionCommerce with the following elements: a hero banner with a promotional message and CTA button, a section showcasing 4 featured product categories as cards with icons and labels, a 'Trending Products' grid displaying 8 product cards (image, name, price, rating stars, Add to Cart button), a 'Group Deals' banner promoting active group buying campaigns with a countdown timer and participant progress bar, and a footer with navigation links, social icons, and a newsletter signup. Use a clean white background with blue (#2563EB) primary accents. Font: Inter. Responsive layout optimized for 1440px desktop width."

### 2.2 Product Listing Page
**Prompt**: "Design a product listing page for FusionCommerce with: a left sidebar containing filter panels for Category (checkbox list), Price Range (dual slider), Vendor (checkbox list), Rating (star selection), and Availability (toggle). The main content area shows a top bar with result count, sort dropdown (Relevance, Price Low-High, Price High-Low, Newest, Best Rated), and grid/list view toggle. Product cards display: product image (16:9 ratio), product name, vendor name in small gray text, price with currency, rating as stars with count, and a hover state revealing the Add to Cart button. Include pagination at the bottom. Desktop width: 1440px. Color: blue (#2563EB) for interactive elements."

### 2.3 Product Detail Page
**Prompt**: "Design a product detail page for FusionCommerce showing: a left panel with a large product image and thumbnail gallery below it, a right panel with product name (24px bold), vendor name with link, star rating with review count, price in large text with currency, variant selectors (Size as pill buttons, Color as swatches), quantity selector with +/- buttons, prominent 'Add to Cart' button (blue #2563EB, full width), and a secondary 'Add to Wishlist' outline button. Below the fold: tabbed content with Description, Specifications, and Reviews tabs. The Reviews tab shows individual reviews with user name, date, star rating, and comment text. Include a 'Related Products' carousel at the bottom with 4 product cards."

### 2.4 Shopping Cart Page
**Prompt**: "Design a shopping cart page for FusionCommerce with: a main section showing a table/list of cart items, each row displaying product thumbnail, product name with variant info, unit price, quantity selector with +/- buttons and remove icon, and line total. Below the items: a coupon code input with 'Apply' button. Right sidebar shows the Order Summary card with Subtotal, Shipping estimate, Tax estimate, Discount line (if coupon applied, shown in green), and a bold Total. Include a prominent 'Proceed to Checkout' button (blue #2563EB) and a 'Continue Shopping' text link. Empty cart state shows an illustration and 'Start Shopping' CTA."

### 2.5 Checkout Flow
**Prompt**: "Design a 4-step checkout flow for FusionCommerce with a horizontal stepper at the top showing: Step 1 Shipping, Step 2 Payment, Step 3 Review, Step 4 Confirmation. Each step highlights the current position. Step 1: Shipping address form (name, address line 1, address line 2, city, state, postal code, country dropdown) and shipping method radio buttons (Standard, Express, Overnight, Same-Day with prices). Step 2: Payment method selection (Credit Card with card number/expiry/CVV fields, Digital Wallet, BNPL option). Step 3: Full order review with items list, shipping details, payment details, and Edit links for each section, plus the Place Order button. Step 4: Success confirmation with checkmark animation, order ID, estimated delivery date, and Continue Shopping button."

### 2.6 Group Buying Campaign Page
**Prompt**: "Design a group buying campaign page for FusionCommerce with: a hero section showing the campaign product image, product name, original price with strikethrough, discounted group price in large green text, and the discount percentage in a badge. Below: a circular progress indicator showing current participants vs. minimum required (e.g., '7 of 10 needed'), a countdown timer showing days:hours:minutes:seconds until expiration, and a prominent 'Join This Campaign' button (violet #7C3AED). Include a 'Share Campaign' section with social media buttons (WhatsApp, Facebook, Twitter, Copy Link). Below the fold: campaign rules, product details, and a list of recent participants (avatars with join timestamps)."

## 3. Figma Design Prompts: Admin Dashboard

### 3.1 Admin Dashboard Home
**Prompt**: "Design an admin dashboard for FusionCommerce with a left sidebar navigation (Dashboard, Products, Orders, Inventory, Campaigns, Payments, Shipping, Workflows, Settings) with icons. The main content area shows: a top row of 4 KPI cards (Total Revenue with sparkline, Orders Today with trend arrow, Active Products count, Low Stock Alerts count). Below: a line chart showing Orders Over Time (last 30 days) and a bar chart showing Revenue by Category. Bottom section: a Recent Orders table with columns for Order ID, Customer, Items, Total, Status (color-coded badge), and Date. Use a light gray background (#F9FAFB) with white cards. Primary color: blue #2563EB."

### 3.2 Order Management View
**Prompt**: "Design an order management page for the FusionCommerce admin panel with: a filter bar containing status dropdown (All, Created, Confirmed, Paid, Shipped, Delivered, Cancelled), date range picker, and search input. Below: a data table with columns for Order ID (monospace font), Customer Name, Items (count with tooltip showing details), Total (formatted currency), Status (color-coded pill badge: blue=created, yellow=confirmed, green=paid, purple=shipped, emerald=delivered, red=cancelled), Date, and Actions (View, Cancel). Include bulk action checkboxes and an Export button. Clicking a row expands to show the order timeline with status changes and timestamps."

### 3.3 Inventory Dashboard
**Prompt**: "Design an inventory management dashboard for FusionCommerce admin with: alert banners at the top for critically low stock items (red) and reorder suggestions (amber). Main content: a table with columns for SKU, Product Name, Available Stock (with colored bars: green >50, amber 10-50, red <10), Reserved Stock, Total Stock, Last Updated, and Actions (Adjust, History). Include a search bar and category filter. A sidebar panel (opened on Adjust click) shows the stock adjustment form: current quantity, adjustment type (Set/Add/Remove), new quantity, and reason field. Top right: a 'Bulk Import' button for CSV uploads."

## 4. Figma Design Prompts: Mobile Views

### 4.1 Mobile Product Listing
**Prompt**: "Design a mobile-first (375px width) product listing page for FusionCommerce. Top: a sticky header with hamburger menu, search icon, and cart icon with badge count. Below: horizontal scrollable category chips. Products displayed as a 2-column grid with compact cards: square product image, product name (max 2 lines, ellipsis), price, and a small heart icon for wishlist. A floating filter button in the bottom right opens a bottom sheet with filter options. Infinite scroll for loading more products."

### 4.2 Mobile Checkout
**Prompt**: "Design a mobile checkout flow (375px width) for FusionCommerce. Use a vertical stepper instead of horizontal. Step 1: compact shipping form with auto-complete address and shipping method accordion. Step 2: Payment method cards stacked vertically with expandable card entry form. Step 3: Order summary as a collapsible accordion with item count and total, plus a sticky 'Place Order' button at the bottom of the screen. Success screen: centered checkmark, order ID, and a 'Track Order' button."

## 5. Make (Integromat) Automation Prompts

### 5.1 Order Notification Automation
**Prompt**: "Create a Make scenario for FusionCommerce that triggers when a new order is created via webhook (receiving order.created event payload with orderId, customerId, total, items, currency). The scenario should: 1) Look up the customer email from a customer database module. 2) Format an order confirmation email with HTML template including order ID, item list, total, and estimated delivery. 3) Send the email via SendGrid or SMTP module. 4) Log the notification to a Google Sheet with timestamp, orderId, customerId, and delivery status. Include error handling with a fallback to Slack notification if email fails."

### 5.2 Inventory Alert Automation
**Prompt**: "Create a Make scenario for FusionCommerce that monitors inventory levels. Trigger: webhook receiving inventory.reserved events. Logic: 1) Check if the remaining quantity after reservation is below threshold (configurable, default 10). 2) If below threshold, send a Slack message to the #inventory-alerts channel with product SKU, product name, current stock level, and a link to the inventory dashboard. 3) If below critical threshold (5 units), also send an email to the procurement team. 4) Log all alerts to an Airtable base for tracking. Include a filter to avoid duplicate alerts within a 1-hour window."

### 5.3 Group Campaign Automation
**Prompt**: "Create a Make scenario for FusionCommerce group buying campaign management. Trigger: webhook receiving group-commerce.campaign.successful event. Logic: 1) Retrieve full campaign details including all participant user IDs. 2) For each participant, look up their email and order details. 3) Generate a batch of discounted orders at the group price. 4) Send personalized success notification emails to all participants with their order confirmation and discount details. 5) Post a success summary to the #campaigns Slack channel with campaign ID, product name, participant count, and total revenue. Use iterator module for participant processing."

### 5.4 Shipping Status Automation
**Prompt**: "Create a Make scenario for FusionCommerce shipping notifications. Trigger: scheduled poll every 15 minutes checking the shipping carrier API for status updates. Logic: 1) Fetch all active shipments from the Shipping Service API. 2) For each shipment, query the carrier tracking API for current status. 3) Compare with last known status stored in a data store. 4) If status changed, send a push notification and email to the customer with updated tracking info. 5) If status is 'delivered', update the order status via the Orders Service API. 6) Log all status changes to the tracking history database."

### 5.5 Daily Analytics Report Automation
**Prompt**: "Create a Make scenario for FusionCommerce daily business reporting. Trigger: scheduled daily at 08:00 UTC. Logic: 1) Query the Orders Service API for yesterday's orders (filter by date range). 2) Calculate KPIs: total orders, total revenue, average order value, top 5 products by quantity, order status distribution. 3) Query the Inventory Service API for current low-stock items. 4) Format results into an HTML email report with charts (use QuickChart.io for chart images). 5) Send the report to the business-analytics@fusioncommerce.io distribution list. 6) Post a summary to the #daily-metrics Slack channel."

## 6. Design Component Library Prompts

### 6.1 Button Component
**Prompt**: "Design a button component library for FusionCommerce with these variants: Primary (filled blue #2563EB, white text), Secondary (outline blue, blue text), Danger (filled red #DC2626, white text), Ghost (transparent, blue text on hover). Each variant has 3 sizes: Small (32px height, 14px font), Medium (40px height, 16px font), Large (48px height, 18px font). Include states: Default, Hover (darken 10%), Active (darken 20%), Disabled (50% opacity), Loading (spinner icon). Border radius: 6px. Font: Inter Semi-Bold."

### 6.2 Form Input Component
**Prompt**: "Design a form input component library for FusionCommerce with: Text Input, Number Input, Select Dropdown, Textarea, Checkbox, Radio Button, Toggle Switch, Date Picker, and Search Input with icon. Each component shows states: Default (gray border #D1D5DB), Focus (blue border #2563EB with ring), Error (red border #DC2626 with error message below), Disabled (gray background), and Filled. Include label above each input, optional helper text below, and required indicator (red asterisk). Border radius: 4px. Font: Inter Regular 14px."

### 6.3 Status Badge Component
**Prompt**: "Design a status badge component for FusionCommerce order statuses with these variants: Created (blue background #DBEAFE, blue text #1E40AF), Confirmed (yellow background #FEF3C7, amber text #92400E), Paid (green background #D1FAE5, green text #065F46), Shipped (purple background #EDE9FE, purple text #5B21B6), Delivered (emerald background #A7F3D0, emerald text #064E3B), Cancelled (red background #FEE2E2, red text #991B1B), Failed (gray background #F3F4F6, gray text #374151). Pill shape with 4px border radius, 12px font, and 16px horizontal padding."

## 7. Design Handoff Notes

### 7.1 Responsive Breakpoints
| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | 375px | Single column |
| Tablet | 768px | 2-column product grid |
| Desktop | 1024px | Sidebar + content |
| Wide | 1440px | Full layout |

### 7.2 Animation Specifications
- Page transitions: 200ms ease-in-out
- Button hover: 150ms ease
- Modal open/close: 300ms ease-out
- Toast notifications: Slide in from top, 200ms
- Loading spinners: 1s infinite rotation

### 7.3 Accessibility Requirements
- WCAG 2.1 AA compliance minimum
- Color contrast ratio: 4.5:1 for text, 3:1 for large text
- Focus indicators visible on all interactive elements
- Screen reader labels on all icons and images
- Keyboard navigable: all interactions accessible without mouse
