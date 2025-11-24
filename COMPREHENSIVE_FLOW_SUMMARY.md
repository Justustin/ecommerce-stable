# Laku Platform - Comprehensive Flow Summary

Complete technical flow for the group buying (grosir) e-commerce platform.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Warehouse Inventory Model](#warehouse-inventory-model)
3. [Complete Group Buying Flow](#complete-group-buying-flow)
4. [Service Responsibilities](#service-responsibilities)
5. [Database Schema Summary](#database-schema-summary)

---

## Architecture Overview

### Microservices Structure

| Service | Port | Responsibility |
|---------|------|----------------|
| product-service | 3002 | Products, categories, variants |
| factory-service | 3003 | Factory management, verification |
| group-buying-service | 3004 | Sessions, participants, grosir config |
| order-service | 3005 | Orders, order items |
| payment-service | 3006 | Payments, escrow, Xendit integration |
| notification-service | 3007 | Push notifications, emails |
| warehouse-service | 3008 | Inventory, purchase orders, stock |
| wallet-service | 3010 | User wallets, transactions, withdrawals |
| logistics-service | 3011 | Shipping rates, shipments, tracking |
| settlement-service | 3013 | Factory settlements |
| address-service | 3015 | User addresses |

---

## Warehouse Inventory Model

### Core Concept

The warehouse tracks **actual stock per variant** and automatically reorders bundles from factories when stock depletes.

### Key Tables

#### 1. `grosir_bundle_composition`
Defines how many units of each variant are in one wholesale bundle.

```
Product: T-Shirt
Bundle = 4S + 4M + 4L = 12 units total

Records:
- product_id, variant_id=S, units_in_bundle=4
- product_id, variant_id=M, units_in_bundle=4
- product_id, variant_id=L, units_in_bundle=4
```

#### 2. `warehouse_inventory`
Tracks actual stock with reorder management.

```
Fields:
- quantity: Current stock
- reserved_quantity: Reserved for orders
- available_quantity: quantity - reserved (computed)
- max_stock_level: Maximum warehouse holds (e.g., 8)
- reorder_threshold: Order new bundle when hits this (e.g., 4)
```

### Inventory Flow Example

```
Initial Setup:
  Bundle Composition: 4S + 4M + 4L
  Max Stock: 8 per variant
  Reorder At: 4 per variant

Starting Stock: 8S, 8M, 8L
        ↓
User buys 5M
        ↓
Stock: 8S, 3M, 8L
  → M is LOW (3 < threshold 4)
  → Trigger: Order bundle from factory
        ↓
User buys 2M
        ↓
Stock: 8S, 1M, 8L
  → M is CRITICAL
        ↓
Bundle arrives: +4S, +4M, +4L
        ↓
Stock: 12S, 5M, 12L → Capped at max
Final: 8S, 5M, 8L
```

### Stock Status Logic

```typescript
if (available <= 0) → "out_of_stock" (LOCKED)
else if (quantity <= reorder_threshold) → "low_stock" (REORDER)
else → "in_stock" (OK)
```

---

## Complete Group Buying Flow

### Step 1: Admin Product Setup

#### 1.1 Create Product
**Service:** product-service
**Endpoint:** `POST /api/products`

```json
{
  "factoryId": "uuid",
  "categoryId": "uuid",
  "sku": "TSHIRT-001",
  "name": "Premium T-Shirt",
  "basePrice": 150000,
  "costPrice": 80000,
  "moq": 100,
  "groupDurationHours": 168
}
```

#### 1.2 Add Variants
**Endpoint:** `POST /api/products/{id}/variants`

```json
[
  { "sku": "TSHIRT-S", "variantName": "Small", "priceAdjustment": 0 },
  { "sku": "TSHIRT-M", "variantName": "Medium", "priceAdjustment": 5000 },
  { "sku": "TSHIRT-L", "variantName": "Large", "priceAdjustment": 10000 }
]
```

#### 1.3 Configure Bundle Composition
**Service:** group-buying-service
**Endpoint:** `POST /api/admin/bundle-composition`

```json
[
  { "productId": "uuid", "variantId": "S-uuid", "unitsInBundle": 4 },
  { "productId": "uuid", "variantId": "M-uuid", "unitsInBundle": 4 },
  { "productId": "uuid", "variantId": "L-uuid", "unitsInBundle": 4 }
]
```

#### 1.4 Initialize Warehouse Inventory
**Service:** warehouse-service
**Endpoint:** `POST /api/inventory`

```json
[
  {
    "productId": "uuid",
    "variantId": "S-uuid",
    "quantity": 8,
    "maxStockLevel": 8,
    "reorderThreshold": 4
  },
  {
    "productId": "uuid",
    "variantId": "M-uuid",
    "quantity": 8,
    "maxStockLevel": 8,
    "reorderThreshold": 4
  },
  {
    "productId": "uuid",
    "variantId": "L-uuid",
    "quantity": 8,
    "maxStockLevel": 8,
    "reorderThreshold": 4
  }
]
```

---

### Step 2: Create Group Buying Session

**Service:** group-buying-service
**Endpoint:** `POST /api/group-buying`

```json
{
  "productId": "uuid",
  "factoryId": "uuid",
  "targetMoq": 100,
  "groupPrice": 95000,
  "priceTier25": 95000,
  "priceTier50": 85000,
  "priceTier75": 75000,
  "priceTier100": 65000,
  "endTime": "2025-12-31T23:59:59Z",
  "estimatedCompletionDate": "2026-01-15T00:00:00Z"
}
```

**Response:** Returns session with `id` and `sessionCode`

---

### Step 3: Users Join Session

**Endpoint:** `POST /api/group-buying/{id}/join`

```json
{
  "userId": "uuid",
  "quantity": 5,
  "variantId": "M-uuid",
  "unitPrice": 95000,
  "totalPrice": 475000
}
```

**Flow:**
1. Check `warehouse_inventory` for variant availability
2. If `available_quantity >= requested` → Allow join
3. Reserve stock: `reserved_quantity += quantity`
4. Create participant record
5. Create escrow payment via payment-service
6. Return Xendit payment URL

---

### Step 4: Payment Processing

#### 4.1 User Pays
User completes payment via Xendit link

#### 4.2 Webhook Received
**Endpoint:** `POST /api/payments/webhook`

```json
{
  "external_id": "PAYMENT_CODE",
  "status": "PAID",
  "paid_at": "2025-11-20T15:30:00Z"
}
```

**Actions:**
- Mark payment as "paid"
- Funds held in escrow
- Update participant status

---

### Step 5: Session Expiration (CRON)

**Endpoint:** `POST /api/group-buying/process-expired`

**Flow:**

```
Check MOQ reached?
    ↓
NO → Refund all participants
    → Mark session "failed"
    → Release reserved stock
    ↓
YES → Calculate final tier
    → Issue tier refunds to wallets
    → Create orders for participants
    → Check warehouse stock
    ↓
    Stock sufficient?
        ↓
        YES → Deduct from warehouse
            → Release escrow
            → Mark "success"
        ↓
        NO → Calculate bundles needed
           → Create Purchase Order
           → Send WhatsApp to factory
           → Mark "pending_stock"
```

### Tier Refund Calculation

```
User paid: Rp 95,000/unit (Tier 25 price)
Final tier: 100% (Rp 65,000/unit)
Refund: Rp 95,000 - Rp 65,000 = Rp 30,000/unit → User wallet
```

---

### Step 6: Order Creation

**Service:** order-service
**Endpoint:** `POST /api/orders/bulk`

```json
{
  "groupSessionId": "uuid"
}
```

**Creates for each participant:**
- Order with product snapshot
- Order items
- Links to payment record
- Status: "processing"

---

### Step 7: Warehouse Stock Check & Reorder

**Service:** warehouse-service

#### If Stock Available:
```typescript
// Deduct from inventory
warehouse_inventory.quantity -= orderQuantity
warehouse_inventory.reserved_quantity -= orderQuantity
```

#### If Stock Insufficient:
```typescript
// Calculate bundles needed
const bundleComposition = getBundleComposition(productId, variantId)
const bundlesNeeded = Math.ceil(shortage / bundleComposition.units_in_bundle)

// Create Purchase Order
createPurchaseOrder({
  factoryId,
  productId,
  variantId,
  quantity: bundlesNeeded * unitsInBundle,
  unitCost,
  shippingCost
})

// Notify factory via WhatsApp
sendWhatsAppToFactory(factory, purchaseOrder)
```

---

### Step 8: Factory Fulfillment

1. Factory receives WhatsApp notification
2. Factory produces/ships bundles
3. Warehouse receives stock
4. Warehouse updates inventory
5. Orders become ready for shipping

---

### Step 9: Shipping

**Service:** logistics-service

#### 9.1 Get Rates
**Endpoint:** `POST /api/rates`

```json
{
  "orderId": "uuid",
  "originPostalCode": "40123",
  "destinationPostalCode": "12190",
  "couriers": ["jne", "jnt", "sicepat"]
}
```

#### 9.2 Create Shipment
**Endpoint:** `POST /api/shipments`

Creates shipment with Biteship, returns tracking number.

#### 9.3 Track Delivery
**Endpoint:** `GET /api/shipments/track/{trackingNumber}`

---

### Step 10: Settlement

**Service:** settlement-service
**Endpoint:** `POST /api/settlements`

```json
{
  "factoryId": "uuid",
  "periodStart": "2025-11-01T00:00:00Z",
  "periodEnd": "2025-11-30T23:59:59Z",
  "totalAmount": 5000000,
  "platformFee": 250000,
  "netAmount": 4750000
}
```

---

## Service Responsibilities

### What Each Service Should Access

| Service | Own Tables | Can Call (HTTP) |
|---------|------------|-----------------|
| product-service | products, product_variants, categories, product_images | - |
| factory-service | factories, factory_reviews | - |
| group-buying-service | group_buying_sessions, group_participants, grosir_bundle_composition | warehouse-service, payment-service |
| order-service | orders, order_items | payment-service, group-buying-service |
| payment-service | payments, refunds | wallet-service, order-service |
| warehouse-service | warehouse_inventory, warehouse_purchase_orders, warehouse_invoices | logistics-service, notification-service |
| wallet-service | user_wallets, wallet_transactions, wallet_withdrawals | - |
| logistics-service | shipments, shipment_tracking_events | - |
| settlement-service | factory_settlements, transaction_ledger | payment-service |

**Rule:** Services should NOT directly access other services' tables. Use HTTP calls instead.

---

## Database Schema Summary

### Core Grosir Tables

```sql
-- Bundle composition (what's in each bundle)
grosir_bundle_composition
  - id, product_id, variant_id, units_in_bundle

-- Warehouse stock tracking
warehouse_inventory
  - id, product_id, variant_id
  - quantity, reserved_quantity, available_quantity
  - max_stock_level, reorder_threshold

-- Purchase orders to factory
warehouse_purchase_orders
  - id, factory_id, product_id, variant_id
  - quantity, unit_cost, shipping_cost, total_cost
  - status, tracking_number
```

### Key Enums

```sql
group_status: forming, active, moq_reached, pending_stock,
              stock_received, success, failed, cancelled

order_status: pending_payment, paid, processing, shipped,
              delivered, cancelled, refunded

payment_status: pending, processing, paid, refunded, failed, expired
```

---

## API Quick Reference

### Group Buying Flow

| Step | Service | Endpoint |
|------|---------|----------|
| Create product | product | POST /api/products |
| Add variants | product | POST /api/products/{id}/variants |
| Set bundle composition | group-buying | POST /api/admin/bundle-composition |
| Init inventory | warehouse | POST /api/inventory |
| Create session | group-buying | POST /api/group-buying |
| Join session | group-buying | POST /api/group-buying/{id}/join |
| Check availability | group-buying | GET /api/group-buying/{id}/variant-availability |
| Process payment | payment | POST /api/payments/webhook |
| Process expired | group-buying | POST /api/group-buying/process-expired |
| Create bulk orders | order | POST /api/orders/bulk |
| Get shipping rates | logistics | POST /api/rates |
| Create shipment | logistics | POST /api/shipments |
| Create settlement | settlement | POST /api/settlements |

---

*Last Updated: November 2025*
