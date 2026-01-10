# LAKOO Clean Slate Implementation Guide

## Overview

This guide helps you start fresh with the new LAKOO business model:
- **Multi-Brand Platform**: 15 official LAKOO brands pulling from central warehouse
- **0% Commission Marketplace**: Third-party sellers with advertising revenue
- **No Group Buying**: Direct purchase model

---

## Quick Start (5 Steps)

### Step 1: Backup & Switch Schema

```bash
# Backup current database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Replace the schema
cp packages/database/prisma/schema.clean.prisma packages/database/prisma/schema.prisma
```

### Step 2: Reset Database

```bash
# Reset and apply new schema
cd packages/database
npx prisma migrate reset --force
npx prisma generate
```

### Step 3: Seed Brands

```bash
npx prisma db seed
```

### Step 4: Delete Old Services

```bash
rm -rf services/group-buying-service
```

### Step 5: Update Services

The following services need modification:
- `payment-service` - Remove escrow methods
- `order-service` - Add brand_id, remove group session refs

---

## What Changed

### Removed (Group Buying)

| Table | Status |
|-------|--------|
| `group_buying_sessions` | ❌ Removed |
| `group_participants` | ❌ Removed |
| `grosir_variant_allocations` | ❌ Removed (was for session-based allocation) |

### Added (Brands & Ads)

| Table | Purpose |
|-------|---------|
| `brands` | 15 official LAKOO brands |
| `brand_products` | Product-brand assignments with pricing |
| `suppliers` | Simplified factory/supplier table |
| `seller_products` | Third-party seller products |
| `seller_inventory` | Seller's own inventory |
| `seller_ad_balance` | Seller's ad credits |
| `ad_campaigns` | CPC/CPM advertising campaigns |
| `ad_impressions` | Ad view tracking |
| `ad_clicks` | Ad click tracking |
| `ad_conversions` | Sales from ads |
| `banner_ad_slots` | Fixed banner positions |
| `banner_ad_bookings` | Banner reservations |

### Kept (Critical Grosir Logic)

| Table | Purpose |
|-------|---------|
| `warehouse_inventory` | Warehouse stock levels |
| `warehouse_purchase_orders` | Orders to suppliers |
| `grosir_bundle_config` | Units per bundle per variant |
| `grosir_warehouse_tolerance` | Max excess units allowed |

---

## New Service Structure

```
services/
├── auth-service/           # Keep as-is
├── address-service/        # Keep as-is
├── product-service/        # Modify: add brand assignment
├── brand-service/          # NEW: Brand management
├── warehouse-service/      # Keep: Grosir logic preserved
├── order-service/          # Modify: add brand_id, remove group refs
├── payment-service/        # Modify: remove escrow
├── logistics-service/      # Keep as-is
├── notification-service/   # Keep as-is
├── wallet-service/         # Keep: repurpose for promo credits
├── seller-service/         # Modify: add seller products
├── advertising-service/    # NEW: Ad campaigns & tracking
├── whatsapp-service/       # Keep as-is
└── (group-buying-service)  # DELETE
```

---

## Implementation Order

### Phase 1: Core (Week 1)
1. Apply new schema
2. Delete group-buying-service
3. Create brand-service
4. Modify payment-service (remove escrow)
5. Modify order-service (add brand support)

### Phase 2: Marketplace (Week 2)
1. Enhance seller-service
2. Add seller product management
3. Seller inventory separate from warehouse

### Phase 3: Advertising (Week 3)
1. Create advertising-service
2. Ad campaign CRUD
3. Impression/click tracking
4. Banner ad system

---

## Key Code Changes

### Payment Service - Remove Escrow

```typescript
// DELETE these methods from payment.service.ts:
- createEscrowPayment()
- releaseEscrow()

// DELETE these routes from payment.routes.ts:
- POST /api/payments/escrow
- POST /api/payments/release-escrow
- POST /api/payments/refund-session
- POST /api/payments/bot
```

### Order Service - Add Brand Support

```typescript
// ADD to createOrder():
interface CreateOrderDTO {
  userId: string;
  brandId?: string;      // NEW: For brand orders
  sellerId?: string;     // NEW: For seller orders
  items: OrderItemDTO[];
  shippingAddressId: string;
}
```

### Brand Service - New Endpoints

```
GET    /api/brands                     - List all brands
GET    /api/brands/:slug               - Get brand by slug
GET    /api/brands/:slug/products      - Get brand products

# Admin
POST   /api/brands                     - Create brand
PATCH  /api/brands/:id                 - Update brand
POST   /api/brands/:id/products        - Assign product
DELETE /api/brands/:id/products/:pid   - Remove product
```

---

## Grosir Logic Preserved

The warehouse service grosir allocation logic is UNCHANGED:

```typescript
// services/warehouse-service/src/services/warehouse.service.ts

// These methods are preserved:
fulfillBundleDemand()       // Calculate bundles needed
checkBundleOverflow()       // Check variant constraints
getInventoryStatus()        // Get stock status
reserveInventory()          // Reserve stock for order

// Tables used:
// - grosir_bundle_config (units_per_bundle per variant)
// - grosir_warehouse_tolerance (max_excess_units per variant)
// - warehouse_inventory (current stock)
```

### How Grosir Works in New Model

1. **Brand orders product** → Warehouse checks inventory
2. **Insufficient stock** → Calculate bundles needed
3. **Check tolerance** → Will bundle exceed max_excess_units?
4. **If OK** → Create purchase order to supplier
5. **If exceeded** → Variant is "locked" until others catch up

---

## Files Created

```
packages/database/prisma/
├── schema.clean.prisma     # New clean schema
└── seed-brands.ts          # 15 LAKOO brands seed

CLEAN_SLATE_GUIDE.md        # This file
MIGRATION_PLAN.md           # Detailed migration plan
```

---

## Next Steps

1. **Review the new schema**: `packages/database/prisma/schema.clean.prisma`
2. **Decide on approach**:
   - Option A: Apply schema now, build services incrementally
   - Option B: Build services first, apply schema when ready
3. **Let me know which to start with**:
   - "Apply schema" - Reset DB and apply new schema
   - "Build brand service" - Create the brand service
   - "Modify payment service" - Remove escrow code
   - "Show me the architecture" - Service interaction diagrams

---

## Questions?

Let me know what you'd like to tackle first!
