# LAKOO Platform - Backend Implementation Plan

**Date:** January 2026
**Branch:** `claude/plan-inventory-services-j8Au2`
**Based on:** `LAKOO_BUSINESS_MODEL.md` and comprehensive codebase analysis

---

## Current Implementation Status

### Fully Implemented Services (13 services)

| Service | Port | Status | Description |
|---------|------|--------|-------------|
| `auth-service` | 3001 | Complete | User auth, OTP via WhatsApp, JWT tokens, batch user lookup |
| `product-service` | 3002 | Complete | Full CRUD for products, variants, categories, grosir bundle config, admin endpoints |
| `factory-service` | 3003 | Complete | Factory/supplier management, verification, analytics, session management |
| `brand-service` | 3004 | Complete | 15 LAKOO brands CRUD, brand-product mappings, featured/bestseller/new-arrival flags |
| `group-buying-service` | 3004 | Complete | Group sessions, tier pricing, bot participants, MOQ tracking (legacy model) |
| `order-service` | 3005 | Complete | Order lifecycle, multi-vendor splitting by factory, bulk orders, status transitions |
| `payment-service` | 3006 | Complete | Xendit integration, escrow, refunds, transaction ledger, webhooks |
| `notification-service` | 3007 | Complete | Push notifications (Web Push), WhatsApp (Twilio), 20+ templates, admin broadcast |
| `logistics-service` | 3008 | Complete | Biteship integration, multi-courier rates, shipment tracking, webhooks |
| `address-service` | 3009 | Complete | User address CRUD, default address management |
| `wallet-service` | 3010 | Complete | Wallet balance, credits (cashback/refund/deposit), batch withdrawals via Xendit |
| `warehouse-service` | 3011 | Complete | Inventory management, grosir bundle allocation, purchase orders, overflow prevention |
| `whatsapp-service` | 3012 | Complete | WhatsApp messaging via Baileys library, OTP delivery, connection management |

### Empty/Stub Services (Need Implementation)

| Service | Current State | Database Schema | Priority |
|---------|---------------|-----------------|----------|
| `seller-service` | Stub (package.json, .env.example, tsconfig.json only) | Full schema exists (`sellers`, `seller_products`, `seller_inventory`) | **HIGH** |
| `review-service` | Empty (.gitkeep only) | Schema exists (`product_reviews`) | **MEDIUM** |

### Missing Services (Schema Exists, No Service)

| Service | Database Tables | Priority |
|---------|-----------------|----------|
| `cart-service` | `cart`, `cart_items` | **HIGH** |
| `advertising-service` | `seller_ad_balance`, `ad_campaigns`, `ad_campaign_products`, `ad_impressions`, `ad_clicks`, `ad_conversions`, `banner_ad_slots`, `banner_ad_bookings` | **HIGH** |

---

## Database Schema Analysis

The Prisma schema (`packages/database/prisma/schema.prisma`) is fully designed for the LAKOO multi-brand + marketplace model:

### Core Models Already Defined:
- **Users & Auth**: `users`, `addresses`
- **Brands**: `brands`, `brand_products`
- **Products**: `categories`, `products`, `product_variants`, `product_images`, `product_reviews`
- **Suppliers**: `suppliers` (replaces old `factories` concept for warehouse suppliers)
- **Warehouse**: `warehouse_inventory`, `warehouse_purchase_orders`, `grosir_bundle_config`, `grosir_warehouse_tolerance`
- **Sellers**: `sellers`, `seller_products`, `seller_inventory`
- **Advertising**: `seller_ad_balance`, `ad_campaigns`, `ad_campaign_products`, `ad_impressions`, `ad_clicks`, `ad_conversions`, `banner_ad_slots`, `banner_ad_bookings`
- **Orders**: `orders`, `order_items`, `payments`, `refunds`
- **Cart**: `cart`, `cart_items`
- **Shipping**: `shipments`
- **Wallet**: `wallet`, `wallet_transactions`
- **Notifications**: `notifications`

---

## Implementation Plan

### Phase 1: Core Shopping Flow (HIGH PRIORITY)

#### 1.1 Implement `cart-service`

**Why:** Cart functionality is essential for the shopping flow. Schema exists but no service.

**Endpoints to implement:**
```
POST   /api/cart                    - Create/get cart for user
GET    /api/cart/:userId            - Get user's cart with items
POST   /api/cart/:cartId/items      - Add item to cart
PATCH  /api/cart/items/:itemId      - Update item quantity
DELETE /api/cart/items/:itemId      - Remove item from cart
DELETE /api/cart/:cartId            - Clear entire cart
POST   /api/cart/:cartId/checkout   - Validate cart and prepare for checkout
```

**Key features:**
- Support for brand products (from warehouse via `brand_id`)
- Support for seller products (from marketplace via `seller_product_id`)
- Real-time grosir bundle constraint checking (call warehouse-service)
- Cart validation before checkout
- Stock availability checks

**Integrations:**
- `warehouse-service` - Check bundle overflow for brand products
- `product-service` - Fetch product details
- `brand-service` - Fetch brand pricing

---

#### 1.2 Implement `seller-service`

**Why:** Third-party marketplace is a core revenue driver (advertising). Schema exists, service is stub.

**Endpoints to implement:**

**Seller Registration & Management:**
```
POST   /api/sellers/register        - Register as seller (user becomes seller)
GET    /api/sellers/:id             - Get seller profile
GET    /api/sellers/slug/:slug      - Get seller by shop slug
PATCH  /api/sellers/:id             - Update seller profile
GET    /api/sellers/:id/dashboard   - Get seller dashboard stats
```

**Seller Product Management:**
```
POST   /api/sellers/:sellerId/products           - Create seller product
GET    /api/sellers/:sellerId/products           - List seller products (paginated)
GET    /api/sellers/:sellerId/products/:id       - Get product details
PATCH  /api/sellers/:sellerId/products/:id       - Update product
DELETE /api/sellers/:sellerId/products/:id       - Delete product
POST   /api/sellers/:sellerId/products/bulk      - Bulk import products
```

**Seller Inventory:**
```
GET    /api/sellers/:sellerId/inventory          - Get inventory status
PATCH  /api/sellers/:sellerId/inventory/:id      - Update stock quantity
```

**Seller Orders:**
```
GET    /api/sellers/:sellerId/orders             - List orders for seller
GET    /api/sellers/:sellerId/orders/:id         - Get order details
PATCH  /api/sellers/:sellerId/orders/:id/ship    - Mark order as shipped
```

**Seller Bank/Payout:**
```
GET    /api/sellers/:sellerId/payouts            - Get payout history
POST   /api/sellers/:sellerId/bank               - Update bank details
```

**Admin Endpoints:**
```
GET    /api/admin/sellers                        - List all sellers (with filters)
GET    /api/admin/sellers/:id                    - Get seller details
POST   /api/admin/sellers/:id/verify             - Verify seller
POST   /api/admin/sellers/:id/suspend            - Suspend seller
POST   /api/admin/sellers/:id/activate           - Activate seller
```

**Key features:**
- 0% commission model (as per business model)
- Shop customization (name, logo, banner, description)
- Bank account management for payouts
- Verification workflow (pending → verified)
- Product CRUD with images (JSON array in schema)
- Inventory tracking per product

---

### Phase 2: Revenue Generation (HIGH PRIORITY)

#### 2.1 Implement `advertising-service`

**Why:** Primary revenue source for marketplace (sellers pay for visibility). Full schema exists.

**Endpoints to implement:**

**Seller Ad Balance:**
```
GET    /api/ads/balance/:sellerId               - Get ad balance
POST   /api/ads/balance/:sellerId/topup         - Top up ad balance (creates payment)
GET    /api/ads/balance/:sellerId/history       - Get transaction history
```

**Campaign Management:**
```
POST   /api/ads/campaigns                       - Create ad campaign
GET    /api/ads/campaigns/:sellerId             - List seller's campaigns
GET    /api/ads/campaigns/:id                   - Get campaign details
PATCH  /api/ads/campaigns/:id                   - Update campaign
POST   /api/ads/campaigns/:id/pause             - Pause campaign
POST   /api/ads/campaigns/:id/resume            - Resume campaign
DELETE /api/ads/campaigns/:id                   - Delete campaign (draft only)
```

**Campaign Products:**
```
POST   /api/ads/campaigns/:id/products          - Add products to campaign
DELETE /api/ads/campaigns/:id/products/:productId - Remove product
```

**Ad Serving (called by frontend):**
```
GET    /api/ads/serve/search                    - Get sponsored products for search results
GET    /api/ads/serve/category/:categoryId      - Get sponsored products for category
GET    /api/ads/serve/homepage                  - Get featured sellers for homepage
POST   /api/ads/track/impression                - Record impression
POST   /api/ads/track/click                     - Record click (deducts balance)
POST   /api/ads/track/conversion                - Record conversion (order placed)
```

**Banner Ads:**
```
GET    /api/ads/banners/slots                   - List available banner slots
POST   /api/ads/banners/book                    - Book a banner slot
GET    /api/ads/banners/bookings/:sellerId      - Get seller's banner bookings
```

**Admin Endpoints:**
```
GET    /api/admin/ads/campaigns                 - List all campaigns
POST   /api/admin/ads/campaigns/:id/approve     - Approve campaign
POST   /api/admin/ads/campaigns/:id/reject      - Reject campaign
GET    /api/admin/ads/analytics                 - Platform ad analytics
GET    /api/admin/ads/revenue                   - Ad revenue reports
```

**Key features:**
- CPC (Cost Per Click) billing - deduct from balance on click
- CPM (Cost Per 1000 Impressions) billing option
- Daily budget caps
- Keyword targeting for search ads
- Category targeting
- Bid-based ad ranking
- Fraud detection (click rate limits)
- Real-time balance deduction

**Pricing models (from schema):**
- `cpc` - Cost per click
- `cpm` - Cost per 1000 impressions
- `cpa` - Cost per acquisition
- `fixed` - Fixed price (banners)

---

### Phase 3: Customer Experience (MEDIUM PRIORITY)

#### 3.1 Implement `review-service`

**Why:** Social proof drives conversions. Schema exists (`product_reviews`), service is empty.

**Endpoints to implement:**

**Customer Endpoints:**
```
POST   /api/reviews                             - Submit review (requires order)
GET    /api/reviews/product/:productId          - Get product reviews (paginated)
GET    /api/reviews/user/:userId                - Get user's reviews
PATCH  /api/reviews/:id                         - Update review (own review only)
DELETE /api/reviews/:id                         - Delete review (own review only)
POST   /api/reviews/:id/helpful                 - Mark review as helpful
```

**Admin Endpoints:**
```
GET    /api/admin/reviews                       - List all reviews (with filters)
GET    /api/admin/reviews/pending               - Get pending reviews for moderation
POST   /api/admin/reviews/:id/approve           - Approve review
POST   /api/admin/reviews/:id/reject            - Reject review
```

**Key features:**
- Verified purchase badge (`is_verified` based on `order_id`)
- Rating (1-5 stars)
- Review text and images (JSON array)
- Moderation workflow (pending → approved/rejected)
- Helpful count tracking
- Rating aggregation for products

---

### Phase 4: Service Updates (MEDIUM PRIORITY)

#### 4.1 Update `order-service`

**Current state:** Works with factory-based orders, needs updates for brand/seller model.

**Updates needed:**
- Support `order_source` enum (`brand`, `seller`, `direct`)
- Handle brand orders (pull from warehouse inventory)
- Handle seller orders (seller fulfills directly)
- Update order splitting logic (by brand OR by seller, not by factory)
- Integration with `seller-service` for seller order notifications

#### 4.2 Update `product-service`

**Current state:** Uses `factory_id` in products.

**Updates needed:**
- Migrate to `supplier_id` (schema already updated)
- Update factory-service references to supplier-service
- Ensure grosir bundle config works with new supplier model

---

### Phase 5: Future Enhancements (LOW PRIORITY)

#### 5.1 Settlement Service
- Weekly payout calculation for sellers
- Deduct ad spend from payouts
- Integration with Xendit disbursement

#### 5.2 Analytics Service
- Sales dashboards
- Customer metrics (LTV, CAC)
- Inventory turnover reports
- Brand performance comparisons

#### 5.3 Customer Service
- Support ticket system
- Live chat integration
- FAQ/Knowledge base

#### 5.4 Live Streaming Service
- Stream management
- Live chat
- Flash sales during streams

---

## Implementation Order (Recommended)

```
1. cart-service          → Enables shopping flow
2. seller-service        → Enables marketplace
3. advertising-service   → Enables revenue from marketplace
4. review-service        → Enables social proof
5. order-service updates → Full brand/seller order support
6. settlement-service    → Seller payouts
```

---

## Technical Notes

### Database
- PostgreSQL with Prisma ORM
- Shared database package: `@repo/database`
- All services use the same schema

### Service Communication
- HTTP REST between services
- Service URLs configured via environment variables
- Pattern: `{SERVICE_NAME}_URL` (e.g., `WAREHOUSE_SERVICE_URL`)

### Common Patterns Across Services
- Express.js with TypeScript
- Controller → Service → Repository layers
- express-validator for input validation
- Swagger/OpenAPI documentation at `/api-docs`
- Health check at `/health`
- Prisma client from shared package

### Authentication
- JWT tokens from auth-service
- Access token (30 min) + Refresh token (30 days)
- HTTP-only cookies

### External Integrations
- **Xendit**: Payments, refunds, disbursements
- **Biteship**: Shipping rates, shipment booking, tracking
- **Twilio**: WhatsApp notifications
- **Web Push**: Browser push notifications
- **Baileys**: WhatsApp direct messaging (OTP)

---

## Notes on Legacy Code

The `group-buying-service` implements the old Pinduoduo-style group buying model with:
- Group sessions with tier pricing
- Bot participants to guarantee MOQ
- Escrow payments released on MOQ success

This service may need to be:
1. **Deprecated** if LAKOO fully moves to the multi-brand model
2. **Adapted** if group buying features are retained alongside the new model
3. **Kept as-is** for backward compatibility with existing data

The `factory-service` manages factories for the old model. The new schema uses `suppliers` for warehouse suppliers. Consider:
- Renaming to `supplier-service`
- Or keeping both if factories and suppliers serve different purposes

---

## Questions for Business Team

1. Should group buying functionality be retained or deprecated?
2. Are factories and suppliers the same entity, or different?
3. What is the seller verification process (documents required)?
4. What are the minimum ad spend amounts and daily budget limits?
5. Should reviews require moderation before publishing?
6. What is the settlement schedule for seller payouts (weekly, bi-weekly)?

---

## Next Steps

1. Choose which service to implement first
2. Create detailed API specifications
3. Set up service scaffolding (routes, controllers, services, repositories)
4. Implement and test endpoints
5. Update integration with existing services
6. Deploy and monitor

---

*Document created: January 2026*
*Last updated: January 2026*
