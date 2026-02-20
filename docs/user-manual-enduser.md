# User Manual: End User — eCommerce Platform
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Introduction

### 1.1 Purpose
This manual guides end users (shoppers and customers) through the FusionCommerce eCommerce Platform. It covers browsing products, placing orders, managing accounts, participating in group buying campaigns, and tracking shipments.

### 1.2 Audience
End consumers who interact with the FusionCommerce storefront to browse, purchase, and receive products.

### 1.3 Platform Access
FusionCommerce storefronts are accessible through:
- **Web Browser** -- Responsive web application (Next.js / Vue.js storefront)
- **Mobile App** -- React Native application for iOS and Android
- **Social Commerce** -- WhatsApp and TikTok integrations

## 2. Getting Started

### 2.1 Creating an Account
1. Navigate to the FusionCommerce storefront URL
2. Click "Sign Up" or "Create Account"
3. Enter your email address, full name, and password
4. Verify your email by clicking the link sent to your inbox
5. Complete your profile with shipping address and preferences

### 2.2 Logging In
1. Click "Sign In" on the storefront
2. Enter your email and password
3. Optionally enable "Remember Me" for returning visits
4. If two-factor authentication is enabled, enter the verification code

### 2.3 Account Recovery
1. Click "Forgot Password" on the sign-in page
2. Enter your registered email address
3. Check your inbox for a password reset link
4. Create a new password following the security requirements

## 3. Browsing Products

### 3.1 Product Catalog
The product catalog displays all available items organized by category. Each product listing shows:
- Product name and image
- Price with currency
- Brief description
- Availability status (In Stock / Out of Stock)
- Vendor name (for marketplace listings)

### 3.2 Searching for Products
Use the search bar at the top of any page to find products:
- **Text Search** -- Enter product name, description, or SKU
- **Category Browse** -- Navigate through hierarchical product categories
- **Faceted Filters** -- Narrow results by price range, category, vendor, rating, and availability

### 3.3 Product Details
Click on any product to view the detail page:
- Full product description
- Multiple product images
- Available variants (size, color, material)
- Current inventory status
- Customer reviews and ratings
- Related product recommendations
- Vendor information and ratings

### 3.4 Product Comparison
Select up to 4 products to compare side-by-side:
1. Click "Compare" on each product card
2. Navigate to "Compare" view from the toolbar
3. Review specifications, prices, and ratings in a table

## 4. Shopping Cart

### 4.1 Adding Items to Cart
1. On the product detail page, select desired variant options
2. Specify quantity
3. Click "Add to Cart"
4. A confirmation notification will appear

### 4.2 Managing Your Cart
Access your cart by clicking the cart icon in the navigation bar:
- **Update Quantity** -- Use the +/- buttons or type a new number
- **Remove Item** -- Click the trash icon next to the item
- **Save for Later** -- Move items to your wishlist for future purchase
- **Apply Coupon** -- Enter a promo code in the coupon field

### 4.3 Cart Summary
The cart summary displays:
- Itemized list with prices
- Subtotal (before tax and shipping)
- Estimated tax
- Estimated shipping cost
- Discount amount (if coupon applied)
- Order total

## 5. Checkout Process

### 5.1 Step 1: Shipping Information
1. Review or update your shipping address
2. Select a shipping method:
   - **Standard Shipping** (5-7 business days)
   - **Express Shipping** (2-3 business days)
   - **Overnight Shipping** (1 business day)
   - **Hyperlocal Delivery** (same-day, where available)

### 5.2 Step 2: Payment Method
Select your preferred payment option:
- **Credit/Debit Card** -- Visa, Mastercard, American Express
- **Digital Wallet** -- Integrated wallet balance
- **Buy Now Pay Later (BNPL)** -- Split payment into installments
- **Group Payment** -- For group buying campaign orders

### 5.3 Step 3: Order Review
Review your complete order before confirmation:
- All items with quantities and prices
- Shipping address and method
- Payment method
- Final total including tax and shipping

### 5.4 Step 4: Order Confirmation
1. Click "Place Order" to submit
2. The system processes your order, generating a unique order ID
3. An `order.created` event triggers automatic inventory reservation
4. You receive an email confirmation with order details
5. Your order appears in your "My Orders" dashboard

## 6. Group Buying Campaigns

### 6.1 What Is Group Buying?
Group buying allows multiple customers to collectively purchase a product at a discounted price. A campaign defines a minimum number of participants required to unlock the group discount.

### 6.2 Joining a Campaign
1. Browse active group buying campaigns on the "Group Deals" page
2. Click "Join Campaign" on a campaign that interests you
3. Review the campaign details:
   - Product being offered
   - Group discount percentage
   - Current participants vs. minimum required
   - Campaign expiration time
4. Confirm your participation

### 6.3 Campaign Outcomes
- **Campaign Succeeds** -- When the minimum participant threshold is reached, all participants are charged the discounted price and orders are fulfilled
- **Campaign Fails** -- If the campaign expires without reaching the minimum, no charges are applied and participants are notified

### 6.4 Sharing Campaigns
Share active campaigns with friends and social networks to help reach the participation threshold:
- Direct link sharing
- Social media sharing (WhatsApp, Facebook, Twitter)
- Email invitations

## 7. Order Management

### 7.1 Viewing Your Orders
Navigate to "My Orders" in your account dashboard to see all orders with their current status.

### 7.2 Order Status Tracking

| Status | Description |
|--------|-------------|
| Created | Order received, inventory check in progress |
| Confirmed | Inventory reserved, awaiting payment |
| Paid | Payment processed successfully |
| Shipped | Package dispatched with tracking number |
| Delivered | Package delivered to shipping address |
| Cancelled | Order cancelled before shipment |

### 7.3 Order Details
Click on any order to view:
- Complete item list with prices
- Shipping address and method
- Payment details (masked)
- Status timeline showing each stage
- Tracking information (when shipped)

### 7.4 Cancelling an Order
Orders can be cancelled if they have not yet been shipped:
1. Go to "My Orders" and click on the order
2. Click "Cancel Order"
3. Select a cancellation reason
4. Confirm the cancellation
5. Refund will be processed to the original payment method

## 8. Shipment Tracking

### 8.1 Tracking Your Package
Once an order is shipped:
1. Navigate to "My Orders" and click on the shipped order
2. Click "Track Shipment" to view real-time tracking
3. Tracking information includes:
   - Carrier name
   - Tracking number
   - Estimated delivery date
   - Package location updates with timestamps

### 8.2 Delivery Notifications
You will receive notifications at each shipment milestone:
- Order shipped with tracking number
- Package in transit
- Out for delivery
- Package delivered

## 9. Returns and Refunds

### 9.1 Initiating a Return
1. Go to "My Orders" and select the delivered order
2. Click "Return Items"
3. Select the items to return and specify the reason
4. Choose return method (drop-off or pickup)
5. Print the provided return shipping label

### 9.2 Refund Processing
- Refunds are processed within 5-7 business days after the return is received
- Refund is credited to the original payment method
- You will receive an email confirmation when the refund is processed

## 10. Account Settings

### 10.1 Profile Management
- Update name, email, and phone number
- Change password
- Enable or disable two-factor authentication

### 10.2 Address Book
- Add multiple shipping addresses
- Set a default shipping address
- Edit or delete saved addresses

### 10.3 Payment Methods
- Add credit/debit cards (stored securely via Stripe)
- Manage digital wallet balance
- View BNPL payment plans

### 10.4 Notification Preferences
Configure which notifications you receive:
- Order status updates (email, push, SMS)
- Campaign updates for group buying
- Promotional offers and recommendations
- Price drop alerts for wishlist items

## 11. Troubleshooting

### 11.1 Common Issues

| Issue | Solution |
|-------|----------|
| Cannot add item to cart | Check that the product is in stock and the quantity is valid |
| Payment declined | Verify card details, check sufficient funds, try another payment method |
| Order stuck in "Created" status | Inventory check may be processing; allow up to 5 minutes |
| Cannot track shipment | Tracking updates may take up to 24 hours after shipping |
| Account locked | Too many failed login attempts; wait 30 minutes or reset password |

### 11.2 Contacting Support
If you encounter issues not covered above:
- **Email**: support@fusioncommerce.io
- **Live Chat**: Available on the storefront during business hours
- **Help Center**: Searchable knowledge base with FAQs
