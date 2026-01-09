# LAKOO PLATFORM MIGRATION PLAN
## Group Buying → Shein-Style Multi-Brand + Advertising Marketplace

**Created:** January 9, 2026
**Author:** Claude Code
**Status:** Planning Phase

---

## Executive Summary

This document outlines the complete migration strategy for transforming LAKOO from a **group buying platform** to a **Shein-style multi-brand e-commerce platform with advertising-based third-party marketplace**.

### Key Changes:
1. **Remove**: Group buying sessions, escrow payments, bot participants, tier pricing
2. **Keep**: Grosir bundle allocation logic, warehouse inventory, factory PO system
3. **Add**: 15 official LAKOO brands, brand-product assignments, advertising system for sellers

### Migration Approach: **Clean Slate with Preserved Core Logic**
- Delete all group-buying code and tables
- Keep warehouse/grosir allocation logic intact
- Build new brand and advertising systems from scratch

---

## Code Audit

### Files to DELETE (Entire Directories)

```
services/group-buying-service/           # ENTIRE SERVICE - 8 files
├── src/
│   ├── services/group.buying.service.ts        # 1537 lines of group buying logic
│   ├── controllers/group-buying.controller.ts  # HTTP handlers
│   ├── routes/group-buying.routes.ts           # API routes
│   ├── repositories/group.buying.repositories.ts
│   ├── types/index.ts
│   ├── utils/tierPricing.ts                    # Tier pricing calculations
│   ├── utils/botParticipant.ts                 # Bot participant logic
│   ├── utils/botParticipant.test.ts
│   ├── utils/retry.utils.ts
│   ├── utils/logger.utils.ts
│   ├── config/swagger.ts
│   └── index.ts
├── package.json
└── jest.config.js

TOTAL: ~2500 lines of code to delete
```

### Files to KEEP (No Changes)

```
services/auth-service/                   # Keep entirely
services/address-service/                # Keep entirely
services/logistics-service/              # Keep entirely
services/whatsapp-service/               # Keep entirely
services/notification-service/           # Keep entirely (add new notification types later)
services/factory-service/                # Keep (factories become simple suppliers)

services/warehouse-service/              # KEEP - Critical grosir logic!
├── src/services/warehouse.service.ts    # Lines 109-461: Bundle allocation MUST STAY
│   ├── fulfillBundleDemand()           # CRITICAL - grosir bundle calculation
│   ├── checkBundleOverflow()           # CRITICAL - variant locking logic
│   ├── checkAllVariantsOverflow()      # CRITICAL - UI variant status
│   ├── getInventoryStatus()            # Keep
│   └── reserveInventory()              # Keep
└── (all other files)                    # Keep

packages/database/                       # Keep structure, modify schema
```

### Files to MODIFY

#### 1. Payment Service (Remove Escrow Logic)

**File:** `services/payment-service/src/services/payment.service.ts`

```typescript
// DELETE these methods (lines ~255-345):
- createEscrowPayment()           // Lines 255-311
- releaseEscrow()                 // Lines 313-345

// MODIFY this method:
- handlePaidCallback()            // Remove lines 162-247 (escrow handling)
  - Remove: const isEscrowPayment = ...
  - Remove: if (isEscrowPayment && payment.group_session_id) { ... }
  - Keep: Regular order payment handling
```

**File:** `services/payment-service/src/routes/payment.routes.ts`
```typescript
// DELETE these routes:
- POST /api/payments/escrow
- POST /api/payments/release-escrow
- POST /api/payments/refund-session
- POST /api/payments/bot
```

**File:** `services/payment-service/src/types/index.ts`
```typescript
// DELETE:
- CreateEscrowPaymentDTO interface
```

#### 2. Order Service (Remove Group Buying References)

**File:** `services/order-service/src/services/order.service.ts`

```typescript
// MODIFY createBulkOrders():
- Remove groupSessionId parameter
- Remove participant linking to group sessions
- Keep bulk order creation logic (useful for brands)

// DELETE:
- Any calls to GROUP_BUYING_SERVICE
- linkParticipantToOrder() method
```

**File:** `services/order-service/src/routes/order.routes.ts`
```typescript
// MODIFY:
- POST /api/orders/bulk  # Keep but remove group buying context
```

#### 3. Product Service (Add Brand Assignments)

**File:** `services/product-service/src/services/product.service.ts`
```typescript
// ADD new methods:
+ assignToBrand(productId, brandId, brandPrice, brandName?)
+ removeFromBrand(productId, brandId)
+ getBrandProducts(brandId)
+ getProductBrands(productId)
```

#### 4. Warehouse Service (Minor Cleanup)

**File:** `services/warehouse-service/src/services/warehouse.service.ts`
```typescript
// KEEP ALL GROSIR LOGIC - No changes needed!
// The bundle allocation works independently of group buying

// OPTIONAL: Remove group_session_id from fulfillBundleDemand if present
```

#### 5. Wallet Service (Repurpose for Promotional Credits)

**File:** `services/wallet-service/src/services/wallet.service.ts`
```typescript
// RENAME wallet purpose:
// OLD: "Tier refunds"
// NEW: "Promotional credits, cashback, ad credits"

// ADD new transaction types:
+ 'ad_credit'
+ 'promotional_bonus'
+ 'cashback'
```

#### 6. API Gateway

**File:** `api-gateway/src/routes/index.ts`
```typescript
// DELETE routes:
- /api/group-buying/* (all routes)

// ADD routes:
+ /api/brands/*
+ /api/ads/*
+ /api/seller-ads/*
```

### Environment Variables to UPDATE

**Remove:**
```env
GROUP_BUYING_SERVICE_URL
GROUP_BUYING_SERVICE_PORT
BOT_USER_ID
```

**Add:**
```env
BRAND_SERVICE_URL=http://localhost:3013
BRAND_SERVICE_PORT=3013
ADVERTISING_SERVICE_URL=http://localhost:3014
ADVERTISING_SERVICE_PORT=3014
```

---

## Database Changes

### Tables to DROP

```sql
-- Group Buying Core Tables (CASCADE will handle foreign keys)
DROP TABLE IF EXISTS group_participants CASCADE;
DROP TABLE IF EXISTS group_buying_sessions CASCADE;

-- Remove bot-related columns from payments
ALTER TABLE payments
  DROP COLUMN IF EXISTS group_session_id,
  DROP COLUMN IF EXISTS participant_id,
  DROP COLUMN IF EXISTS is_in_escrow,
  DROP COLUMN IF EXISTS escrow_released_at;

-- Remove group session reference from orders
ALTER TABLE orders
  DROP COLUMN IF EXISTS group_session_id;

-- Remove group session reference from warehouse tables
ALTER TABLE warehouse_purchase_orders
  DROP COLUMN IF EXISTS group_session_id;

ALTER TABLE warehouse_invoices
  DROP COLUMN IF EXISTS group_session_id;
```

### Tables to CREATE

#### 1. Brands Table (15 Official LAKOO Brands)

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_code VARCHAR(50) UNIQUE NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,

  -- Branding
  logo_url VARCHAR(500),
  banner_url VARCHAR(500),
  primary_color VARCHAR(7) DEFAULT '#000000',
  secondary_color VARCHAR(7) DEFAULT '#FFFFFF',

  -- Brand Identity
  brand_story TEXT,
  tagline VARCHAR(255),
  target_audience VARCHAR(100),
  style_category VARCHAR(100),

  -- Pricing Strategy
  price_multiplier DECIMAL(5,2) DEFAULT 1.00,
  average_margin_target DECIMAL(5,2) DEFAULT 0.50,

  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  is_official_lakoo_brand BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_status ON brands(status);
CREATE INDEX idx_brands_official ON brands(is_official_lakoo_brand);
```

#### 2. Brand Products (Product-Brand Assignments)

```sql
CREATE TABLE brand_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Brand-Specific Pricing
  brand_price DECIMAL(15,2) NOT NULL,
  brand_discount_price DECIMAL(15,2),
  discount_percentage DECIMAL(5,2),
  discount_start_date TIMESTAMP WITH TIME ZONE,
  discount_end_date TIMESTAMP WITH TIME ZONE,

  -- Brand-Specific Display
  brand_product_name VARCHAR(255),
  brand_description TEXT,
  display_order INTEGER DEFAULT 0,

  -- Flags
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(brand_id, product_id)
);

-- Indexes
CREATE INDEX idx_brand_products_brand ON brand_products(brand_id);
CREATE INDEX idx_brand_products_product ON brand_products(product_id);
CREATE INDEX idx_brand_products_featured ON brand_products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_brand_products_active ON brand_products(is_active) WHERE is_active = true;
```

#### 3. Advertising System Tables

```sql
-- Seller Ad Balance (Prepaid Credits)
CREATE TABLE seller_ad_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  balance DECIMAL(15,2) DEFAULT 0 CHECK (balance >= 0),
  total_deposited DECIMAL(15,2) DEFAULT 0,
  total_spent DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(seller_id)
);

-- Ad Campaigns
CREATE TABLE ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  campaign_name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('product_boost', 'search_ads', 'banner', 'homepage_feature')),

  -- Budget
  daily_budget DECIMAL(15,2) NOT NULL,
  total_budget DECIMAL(15,2),
  spent_today DECIMAL(15,2) DEFAULT 0,
  spent_total DECIMAL(15,2) DEFAULT 0,

  -- Pricing Model
  pricing_model VARCHAR(20) NOT NULL CHECK (pricing_model IN ('cpc', 'cpm', 'cpa', 'fixed')),
  bid_amount DECIMAL(10,2) NOT NULL,

  -- Targeting
  target_categories UUID[],
  target_keywords TEXT[],
  target_locations VARCHAR(100)[],

  -- Schedule
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  is_always_on BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'exhausted')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Campaign Products (which products are promoted)
CREATE TABLE ad_campaign_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  custom_bid DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(campaign_id, product_id)
);

-- Ad Impressions (Tracking)
CREATE TABLE ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),

  -- Impression Details
  placement VARCHAR(50) NOT NULL,
  position INTEGER,
  page_url VARCHAR(500),
  search_query VARCHAR(255),

  -- Cost
  cost DECIMAL(10,4) DEFAULT 0,

  -- Tracking
  session_id VARCHAR(100),
  device_type VARCHAR(20),
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Clicks (Tracking)
CREATE TABLE ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impression_id UUID REFERENCES ad_impressions(id),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),

  -- Click Details
  cost DECIMAL(10,4) NOT NULL,

  -- Tracking
  session_id VARCHAR(100),
  referrer_url VARCHAR(500),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Conversions (Sales from Ads)
CREATE TABLE ad_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id UUID REFERENCES ad_clicks(id),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),

  -- Conversion Details
  order_amount DECIMAL(15,2) NOT NULL,
  commission_amount DECIMAL(15,2) DEFAULT 0,

  -- Attribution
  attribution_window_hours INTEGER DEFAULT 24,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banner Ad Slots (Fixed Positions)
CREATE TABLE banner_ad_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_name VARCHAR(100) UNIQUE NOT NULL,
  slot_location VARCHAR(100) NOT NULL,

  -- Dimensions
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,

  -- Pricing
  price_per_day DECIMAL(15,2) NOT NULL,
  price_per_week DECIMAL(15,2),
  price_per_month DECIMAL(15,2),

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banner Ad Bookings
CREATE TABLE banner_ad_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES banner_ad_slots(id),
  seller_id UUID NOT NULL REFERENCES sellers(id),

  -- Content
  image_url VARCHAR(500) NOT NULL,
  click_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),

  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Payment
  total_price DECIMAL(15,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Ad Tables
CREATE INDEX idx_ad_campaigns_seller ON ad_campaigns(seller_id);
CREATE INDEX idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX idx_ad_impressions_campaign ON ad_impressions(campaign_id);
CREATE INDEX idx_ad_impressions_created ON ad_impressions(created_at);
CREATE INDEX idx_ad_clicks_campaign ON ad_clicks(campaign_id);
CREATE INDEX idx_ad_clicks_created ON ad_clicks(created_at);
CREATE INDEX idx_ad_conversions_campaign ON ad_conversions(campaign_id);
CREATE INDEX idx_banner_bookings_slot ON banner_ad_bookings(slot_id);
CREATE INDEX idx_banner_bookings_dates ON banner_ad_bookings(start_date, end_date);
```

#### 4. Update Existing Tables

```sql
-- Update orders table (add brand_id for brand orders)
ALTER TABLE orders
  ADD COLUMN brand_id UUID REFERENCES brands(id),
  ADD COLUMN order_source VARCHAR(50) DEFAULT 'direct'
    CHECK (order_source IN ('direct', 'brand', 'seller', 'ad_click'));

-- Update order_items (add brand context)
ALTER TABLE order_items
  ADD COLUMN brand_id UUID REFERENCES brands(id),
  ADD COLUMN brand_price DECIMAL(15,2);

-- Update products (add warehouse_only flag)
ALTER TABLE products
  ADD COLUMN is_warehouse_only BOOLEAN DEFAULT true,
  ADD COLUMN warehouse_transfer_price DECIMAL(15,2);

-- Update sellers (add 0% commission flag)
ALTER TABLE sellers
  ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 0.00,
  ADD COLUMN ad_credits_balance DECIMAL(15,2) DEFAULT 0;
```

### Migration Scripts Order

```bash
# Execute in this order:

# 1. Backup database first!
pg_dump lakoo_db > backup_$(date +%Y%m%d).sql

# 2. Drop group buying tables
psql -f migrations/001_drop_group_buying.sql

# 3. Create brand tables
psql -f migrations/002_create_brands.sql

# 4. Create advertising tables
psql -f migrations/003_create_advertising.sql

# 5. Update existing tables
psql -f migrations/004_update_existing_tables.sql

# 6. Seed initial brands
psql -f migrations/005_seed_brands.sql
```

---

## Phase 1: Core Brand System (Week 1-2)

### Objectives
- Remove all group buying code
- Create brand management system
- Enable basic brand shopping (warehouse → brand → customer)

### Duration: ~2 weeks

### Database Changes

**Drop Tables:**
```sql
DROP TABLE group_participants CASCADE;
DROP TABLE group_buying_sessions CASCADE;
```

**Create Tables:**
- `brands`
- `brand_products`

**Modify Tables:**
- `payments` (remove escrow columns)
- `orders` (add brand_id)

### Services to Build

#### New: Brand Service

**Location:** `services/brand-service/`

**Structure:**
```
services/brand-service/
├── src/
│   ├── index.ts
│   ├── config/
│   │   └── swagger.ts
│   ├── controllers/
│   │   └── brand.controller.ts
│   ├── services/
│   │   └── brand.service.ts
│   ├── repositories/
│   │   └── brand.repository.ts
│   ├── routes/
│   │   └── brand.routes.ts
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

**API Endpoints:**
```
# Public (Customer)
GET    /api/brands                           - List all brands
GET    /api/brands/:slug                     - Get brand by slug
GET    /api/brands/:slug/products            - Get brand products (with pagination)
GET    /api/brands/:slug/categories          - Get brand categories
GET    /api/brands/:slug/featured            - Get featured products

# Admin (Brand Manager)
POST   /api/admin/brands                     - Create brand
PATCH  /api/admin/brands/:id                 - Update brand
DELETE /api/admin/brands/:id                 - Delete brand
POST   /api/admin/brands/:id/products        - Assign product to brand
DELETE /api/admin/brands/:id/products/:pid   - Remove product from brand
PATCH  /api/admin/brands/:id/products/:pid   - Update brand product (price, etc)
POST   /api/admin/brands/:id/products/bulk   - Bulk assign products
```

### Services to Modify

#### Payment Service

**Remove:**
- `createEscrowPayment()` method
- `releaseEscrow()` method
- Escrow-related webhook handling

**Keep:**
- `createPayment()` for regular orders
- `handlePaidCallback()` (simplified)
- Refund processing

#### Order Service

**Remove:**
- `createBulkOrders()` group session context
- `linkParticipantToOrder()` method
- All GROUP_BUYING_SERVICE API calls

**Add:**
- `brand_id` to order creation
- Brand-specific order retrieval

### Services to DELETE

```bash
rm -rf services/group-buying-service/
```

### API Gateway Updates

```typescript
// Remove
app.use('/api/group-buying', proxy(GROUP_BUYING_SERVICE_URL));

// Add
app.use('/api/brands', proxy(BRAND_SERVICE_URL));
```

### Testing Requirements

1. **Unit Tests:**
   - Brand CRUD operations
   - Brand product assignment
   - Brand pricing calculation

2. **Integration Tests:**
   - Create brand → Assign product → Purchase flow
   - Multiple brands with same warehouse product
   - Price differentiation between brands

3. **E2E Tests:**
   - Customer browses brand → Adds to cart → Checkout → Payment → Order created

### Success Criteria

- [ ] All group buying code removed
- [ ] 15 brands seeded in database
- [ ] Products can be assigned to multiple brands
- [ ] Customer can purchase from brand storefront
- [ ] Order correctly links to brand
- [ ] Warehouse inventory decrements on purchase
- [ ] Grosir bundle logic still works (variant locking)

### Can Launch After This Phase? **YES (Limited)**

After Phase 1, LAKOO can operate as:
- Multi-brand e-commerce (15 brands)
- Warehouse-backed inventory
- Direct purchase (no group buying)

**Missing:** Third-party sellers, advertising system

---

## Phase 2: Third-Party Marketplace Foundation (Week 3-4)

### Objectives
- Enable third-party sellers to list products
- Implement 0% commission model
- Build seller dashboard

### Duration: ~2 weeks

### Database Changes

**Create Tables:**
- `seller_ad_balance`

**Modify Tables:**
- `sellers` (add commission_rate = 0%)
- `products` (support seller ownership)

### Services to Build/Modify

#### Enhance: Seller Service

**Add Methods:**
```typescript
// Product Management
createSellerProduct(sellerId, productData)
updateSellerProduct(sellerId, productId, updates)
deleteSellerProduct(sellerId, productId)
getSellerProducts(sellerId, filters)

// Inventory
updateSellerInventory(sellerId, productId, quantity)
getSellerInventoryStatus(sellerId)

// Dashboard
getSellerDashboard(sellerId)
getSellerSalesStats(sellerId, dateRange)
```

**New Endpoints:**
```
# Seller Dashboard
GET    /api/seller/dashboard                 - Dashboard overview
GET    /api/seller/products                  - Seller's products
POST   /api/seller/products                  - Create product
PATCH  /api/seller/products/:id              - Update product
DELETE /api/seller/products/:id              - Delete product
GET    /api/seller/orders                    - Seller's orders
GET    /api/seller/analytics                 - Sales analytics
```

### Testing Requirements

1. Seller can register and list products
2. Seller inventory is separate from warehouse
3. Orders route to correct seller
4. 0% commission on sales

### Success Criteria

- [ ] Sellers can register
- [ ] Sellers can list products with own inventory
- [ ] Customer can purchase from sellers
- [ ] Orders correctly attributed to sellers
- [ ] Seller dashboard shows sales

### Can Launch After This Phase? **YES (Marketplace)**

After Phase 2, LAKOO has:
- Multi-brand (15 official brands)
- Third-party marketplace (0% commission)

**Missing:** Advertising revenue system

---

## Phase 3: Advertising System (Week 5-7)

### Objectives
- Build complete advertising platform
- Enable sellers to promote products
- Implement CPC/CPM billing
- Banner ad system

### Duration: ~3 weeks

### Database Changes

**Create Tables:**
- `ad_campaigns`
- `ad_campaign_products`
- `ad_impressions`
- `ad_clicks`
- `ad_conversions`
- `banner_ad_slots`
- `banner_ad_bookings`

### Services to Build

#### New: Advertising Service

**Location:** `services/advertising-service/`

**API Endpoints:**
```
# Seller Ad Management
POST   /api/ads/campaigns                    - Create campaign
GET    /api/ads/campaigns                    - List seller's campaigns
GET    /api/ads/campaigns/:id                - Get campaign details
PATCH  /api/ads/campaigns/:id                - Update campaign
DELETE /api/ads/campaigns/:id                - Delete campaign
POST   /api/ads/campaigns/:id/products       - Add products to campaign
POST   /api/ads/campaigns/:id/pause          - Pause campaign
POST   /api/ads/campaigns/:id/resume         - Resume campaign

# Ad Balance
GET    /api/ads/balance                      - Get ad balance
POST   /api/ads/balance/topup                - Top up ad credits
GET    /api/ads/balance/history              - Transaction history

# Banner Ads
GET    /api/ads/banners/slots                - Available banner slots
POST   /api/ads/banners/book                 - Book banner slot
GET    /api/ads/banners/bookings             - Seller's banner bookings

# Analytics
GET    /api/ads/analytics/overview           - Campaign overview
GET    /api/ads/analytics/campaigns/:id      - Campaign performance
GET    /api/ads/analytics/products           - Product ad performance

# Internal (called by product service)
POST   /api/internal/ads/impression          - Record impression
POST   /api/internal/ads/click               - Record click
POST   /api/internal/ads/conversion          - Record conversion
```

### Product Service Updates

**Modify product listing to include ads:**
```typescript
async getProductList(filters) {
  // Get organic products
  const organicProducts = await this.repository.findProducts(filters);

  // Get sponsored products from ad service
  const sponsoredProducts = await this.adService.getSponsoredProducts({
    category: filters.category,
    searchQuery: filters.query,
    limit: 4
  });

  // Interleave sponsored products (positions 1, 5, 10, etc.)
  return this.interleaveResults(organicProducts, sponsoredProducts);
}
```

### Testing Requirements

1. Seller can create/manage ad campaigns
2. Ad credits properly deducted
3. Impressions/clicks tracked correctly
4. Conversions attributed to campaigns
5. Banner bookings work
6. Campaign pauses when budget exhausted

### Success Criteria

- [ ] Sellers can top up ad balance
- [ ] Product boost campaigns work
- [ ] Search ads show for keywords
- [ ] Banner ads display and rotate
- [ ] Analytics dashboard accurate
- [ ] Ad revenue tracking

### Can Launch After This Phase? **YES (Full Platform)**

After Phase 3, LAKOO is complete:
- Multi-brand e-commerce
- Third-party marketplace (0% commission)
- Advertising revenue system

---

## Phase 4: Polish & Launch Prep (Week 8-10)

### Objectives
- API Gateway optimization
- Admin dashboard
- Performance tuning
- Security audit
- Documentation

### Duration: ~2-3 weeks

### Tasks

1. **API Gateway:**
   - Update all routes
   - Add rate limiting
   - Add caching layer

2. **Admin Dashboard:**
   - Brand management UI
   - Seller approval workflow
   - Ad review system
   - Analytics dashboard

3. **Performance:**
   - Database indexing
   - Query optimization
   - Caching (Redis)

4. **Security:**
   - Penetration testing
   - SQL injection prevention
   - XSS prevention

5. **Documentation:**
   - API documentation (Swagger)
   - Seller onboarding guide
   - Brand manager guide

---

## Implementation Checklist for Phase 1

### Day 1-2: Database Cleanup

- [ ] Backup production database
- [ ] Create migration script for dropping group buying tables
- [ ] Remove group_session_id from payments table
- [ ] Remove group_session_id from orders table
- [ ] Run migration in development environment
- [ ] Verify no foreign key violations

### Day 3-4: Delete Group Buying Service

- [ ] Remove `services/group-buying-service/` directory
- [ ] Update `pnpm-workspace.yaml`
- [ ] Remove from docker-compose (if exists)
- [ ] Remove environment variables
- [ ] Update API gateway to remove routes
- [ ] Remove cron job configurations

### Day 5-6: Create Brand Service

- [ ] Create directory structure
- [ ] Copy boilerplate from existing service
- [ ] Implement brand.repository.ts
- [ ] Implement brand.service.ts
- [ ] Implement brand.controller.ts
- [ ] Define brand.routes.ts
- [ ] Add Swagger documentation

### Day 7-8: Create Brand Tables

- [ ] Create brands migration
- [ ] Create brand_products migration
- [ ] Run migrations
- [ ] Seed 15 initial brands

### Day 9-10: Modify Payment Service

- [ ] Remove createEscrowPayment method
- [ ] Remove releaseEscrow method
- [ ] Simplify handlePaidCallback
- [ ] Remove escrow routes
- [ ] Update types
- [ ] Test payment flow

### Day 11-12: Modify Order Service

- [ ] Remove group buying dependencies
- [ ] Add brand_id to order creation
- [ ] Update order retrieval for brands
- [ ] Test order creation

### Day 13-14: Integration & Testing

- [ ] Write unit tests for brand service
- [ ] Write integration tests
- [ ] Test full purchase flow
- [ ] Test warehouse inventory deduction
- [ ] Test grosir bundle logic still works

---

## Risk Assessment

### High Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking grosir allocation logic | Critical | Don't modify warehouse service core logic |
| Data loss during migration | Critical | Full database backup before migration |
| Payment system disruption | High | Test extensively in staging |
| Incomplete group buying removal | Medium | Code audit for all references |

### Mitigation Strategies

1. **Database Backup:** Take full backup before any migration
2. **Feature Flags:** Use feature flags to gradually roll out
3. **Staging Environment:** Test all changes in staging first
4. **Rollback Plan:** Document rollback procedures for each phase
5. **Monitoring:** Set up alerts for payment failures, order errors

---

## Timeline Summary

```
Week 1-2:  Phase 1 - Core Brand System
           - Remove group buying
           - Create brand service
           - Enable brand shopping

Week 3-4:  Phase 2 - Marketplace Foundation
           - Third-party seller support
           - 0% commission model
           - Seller dashboard

Week 5-7:  Phase 3 - Advertising System
           - Ad campaigns
           - CPC/CPM billing
           - Banner ads
           - Analytics

Week 8-10: Phase 4 - Polish & Launch
           - Admin dashboard
           - Performance tuning
           - Security audit
           - Documentation
```

---

## Questions Answered

### 1. Can we keep the database and just drop group buying tables?
**Yes.** The group buying tables have CASCADE delete on foreign keys. Dropping them won't affect other tables. We just need to remove the group_session_id columns from payments and orders.

### 2. Should we build new services in parallel or modify existing ones?
**Both.** Brand Service and Advertising Service are NEW. Payment Service and Order Service are MODIFIED.

### 3. What's the minimum viable first phase?
**Phase 1** delivers working brand shopping. Customers can browse brands, purchase products, and warehouse inventory works.

### 4. How to handle existing order data?
**Keep it.** Old orders (if any from testing) can remain. Just null out group_session_id references.

### 5. Testing strategy?
- **Unit tests:** Each service independently
- **Integration tests:** Service-to-service calls
- **E2E tests:** Full purchase flow

### 6. Deployment strategy?
**Rolling update** with feature flags. Each phase is independently deployable.

---

## Appendix: Initial Brand Seed Data

```sql
INSERT INTO brands (brand_code, brand_name, slug, tagline, target_audience, style_category, price_multiplier) VALUES
('LAKOO-ELITE', 'LAKOO Elite', 'lakoo-elite', 'Premium Fashion for Modern Professionals', 'Professionals 25-45', 'Premium Casual', 1.50),
('LAKOO-STREET', 'LAKOO Street', 'lakoo-street', 'Urban Style, Bold Statements', 'Youth 18-30', 'Streetwear', 1.20),
('LAKOO-CLASSIC', 'LAKOO Classic', 'lakoo-classic', 'Timeless Elegance', 'Adults 30-50', 'Classic Formal', 1.40),
('LAKOO-ACTIVE', 'LAKOO Active', 'lakoo-active', 'Move Without Limits', 'Fitness Enthusiasts', 'Athleisure', 1.15),
('LAKOO-KIDS', 'LAKOO Kids', 'lakoo-kids', 'Fun Fashion for Little Ones', 'Children 3-12', 'Kids Fashion', 1.10),
('LAKOO-HOMME', 'LAKOO Homme', 'lakoo-homme', 'Refined Menswear', 'Men 25-45', 'Men Premium', 1.45),
('LAKOO-FEMME', 'LAKOO Femme', 'lakoo-femme', 'Elegant Women Fashion', 'Women 25-45', 'Women Premium', 1.45),
('LAKOO-BASICS', 'LAKOO Basics', 'lakoo-basics', 'Everyday Essentials', 'All Ages', 'Basic Essentials', 1.00),
('LAKOO-DENIM', 'LAKOO Denim', 'lakoo-denim', 'Denim Done Right', 'Youth & Adults', 'Denim Specialist', 1.25),
('LAKOO-SWIM', 'LAKOO Swim', 'lakoo-swim', 'Beach Ready Style', 'Beach Lovers', 'Swimwear', 1.20),
('LAKOO-LOUNGE', 'LAKOO Lounge', 'lakoo-lounge', 'Comfort Meets Style', 'Home Comfort Seekers', 'Loungewear', 1.05),
('LAKOO-ECO', 'LAKOO Eco', 'lakoo-eco', 'Sustainable Fashion Forward', 'Eco-Conscious', 'Sustainable', 1.35),
('LAKOO-CURVE', 'LAKOO Curve', 'lakoo-curve', 'Fashion for Every Body', 'Plus Size', 'Plus Size Fashion', 1.20),
('LAKOO-MODEST', 'LAKOO Modest', 'lakoo-modest', 'Elegant Modest Fashion', 'Modest Fashion', 'Modest Wear', 1.25),
('LAKOO-SPORT', 'LAKOO Sport', 'lakoo-sport', 'Performance Athletic Wear', 'Athletes', 'Sports Performance', 1.30);
```

---

**End of Migration Plan**

*This document should be reviewed and updated as implementation progresses.*
