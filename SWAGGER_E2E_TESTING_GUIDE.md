# Swagger E2E Testing Guide

Complete guide to test the Laku Platform ecommerce system end-to-end using Swagger UI.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Service Startup](#service-startup)
3. [Swagger UI Access](#swagger-ui-access)
4. [Testing Flow Overview](#testing-flow-overview)
5. [Phase 1: Setup Data](#phase-1-setup-data)
6. [Phase 2: Product Catalog](#phase-2-product-catalog)
7. [Phase 3: Group Buying Flow](#phase-3-group-buying-flow)
8. [Phase 4: Order & Payment Flow](#phase-4-order--payment-flow)
9. [Phase 5: Logistics & Shipping](#phase-5-logistics--shipping)
10. [Phase 6: Wallet Operations](#phase-6-wallet-operations)
11. [Phase 7: Settlement](#phase-7-settlement)
12. [CRON Job Testing](#cron-job-testing)
13. [Webhook Testing](#webhook-testing)
14. [Sample Test Data](#sample-test-data)

---

## Prerequisites

### 1. Database Setup
```bash
# Ensure PostgreSQL is running
# Run migrations
cd packages/database
npx prisma migrate dev
npx prisma generate
```

### 2. Environment Variables
Each service needs its `.env` file configured:
- Database connection string
- Xendit API keys (for payment-service)
- Biteship API keys (for logistics-service)

### 3. Dependencies
```bash
# Install all dependencies
npm install
# or from root with workspaces
npm run install:all
```

---

## Service Startup

Start services in this order (or all at once if using Docker):

| Order | Service | Port | Command |
|-------|---------|------|---------|
| 1 | product-service | 3002 | `cd services/product-service && npm run dev` |
| 2 | factory-service | 3003 | `cd services/factory-service && npm run dev` |
| 3 | address-service | 3015 | `cd services/address-service && npm run dev` |
| 4 | group-buying-service | 3004 | `cd services/group-buying-service && npm run dev` |
| 5 | order-service | 3005 | `cd services/order-service && npm run dev` |
| 6 | payment-service | 3006 | `cd services/payment-service && npm run dev` |
| 7 | logistics-service | 3011 | `cd services/logistics-service && npm run dev` |
| 8 | wallet-service | 3010 | `cd services/wallet-service && npm run dev` |
| 9 | settlement-service | 3013 | `cd services/settlement-service && npm run dev` |
| 10 | notification-service | 3007 | `cd services/notification-service && npm run dev` |
| 11 | warehouse-service | 3008 | `cd services/warehouse-service && npm run dev` |

---

## Swagger UI Access

Access each service's Swagger documentation at:

| Service | Swagger URL |
|---------|-------------|
| Product Service | http://localhost:3002/api-docs |
| Factory Service | http://localhost:3003/api-docs |
| Group Buying Service | http://localhost:3004/api-docs |
| Order Service | http://localhost:3005/api-docs |
| Payment Service | http://localhost:3006/api-docs |
| Notification Service | http://localhost:3007/api-docs |
| Warehouse Service | http://localhost:3008/api-docs |
| Wallet Service | http://localhost:3010/api-docs |
| Logistics Service | http://localhost:3011/api-docs |
| Settlement Service | http://localhost:3013/api-docs |
| Address Service | http://localhost:3015/api-docs |

---

## Testing Flow Overview

The recommended E2E testing order follows the business flow:

```
Factory Setup → Products → Group Buying → Join Session →
Orders Created → Payment → Escrow Release → Logistics →
Delivery → Wallet Credits → Withdrawals → Settlements
```

---

## Phase 1: Setup Data

### 1.1 Create a Factory

**Service:** Factory Service (http://localhost:3003/api-docs)

**Endpoint:** `POST /api/factories`

```json
{
  "ownerId": "550e8400-e29b-41d4-a716-446655440001",
  "factoryCode": "FACT-BDG-TST-202411",
  "factoryName": "Test Factory Indonesia",
  "description": "Premium textile manufacturer",
  "phoneNumber": "+6281234567890",
  "email": "factory@test.com",
  "province": "Jawa Barat",
  "city": "Bandung",
  "district": "Cimahi",
  "postalCode": "40123",
  "addressLine": "Jl. Industri No. 123",
  "businessLicenseNumber": "SIUP-12345678",
  "taxId": "NPWP-87654321",
  "logoUrl": "https://example.com/logo.png"
}
```

**Save the response:** Note the `id` and `factoryCode` for later use.

### 1.2 Verify Factory (Admin Action)

**Endpoint:** `PATCH /api/factories/{id}/verify`

```json
{
  "verificationStatus": "verified",
  "verifiedBy": "550e8400-e29b-41d4-a716-446655440099"
}
```

### 1.3 Create User Address

**Service:** Address Service (http://localhost:3015/api-docs)

**Endpoint:** `POST /api/addresses`

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "label": "Home",
  "recipientName": "John Doe",
  "phoneNumber": "+6281234567891",
  "province": "DKI Jakarta",
  "city": "Jakarta Selatan",
  "district": "Kebayoran Baru",
  "postalCode": "12190",
  "addressLine": "Jl. Sudirman No. 45",
  "notes": "Near mall"
}
```

### 1.4 Create Category

**Service:** Product Service (http://localhost:3002/api-docs)

**Endpoint:** `POST /api/categories`

```json
{
  "name": "Fashion",
  "description": "All fashion items",
  "iconUrl": "https://example.com/fashion.jpg",
  "displayOrder": 1
}
```

**Save the `id` for product creation.**

---

## Phase 2: Product Catalog

### 2.1 Create Product with Variants

**Service:** Product Service (http://localhost:3002/api-docs)

**Endpoint:** `POST /api/products`

```json
{
  "factoryId": "YOUR_FACTORY_ID",
  "categoryId": "YOUR_CATEGORY_ID",
  "sku": "TSHIRT-PREMIUM-001",
  "name": "Premium Cotton T-Shirt",
  "description": "High quality cotton t-shirt from local factory",
  "basePrice": 150000,
  "costPrice": 80000,
  "moq": 100,
  "groupDurationHours": 168,
  "stockQuantity": 500,
  "weight": 200,
  "lengthCm": 30,
  "widthCm": 25,
  "heightCm": 2,
  "primaryImageUrl": "https://example.com/tshirt-1.jpg"
}
```

**Save the response:** Note the `id` for variant creation.

### 2.2 Add Variants to Product

**Endpoint:** `POST /api/products/{id}/variants`

**Variant 1 - Small:**
```json
{
  "productId": "YOUR_PRODUCT_ID",
  "sku": "TSHIRT-S-BLACK",
  "variantName": "Small - Black",
  "priceAdjustment": 0,
  "stockQuantity": 100
}
```

**Variant 2 - Medium:**
```json
{
  "productId": "YOUR_PRODUCT_ID",
  "sku": "TSHIRT-M-BLACK",
  "variantName": "Medium - Black",
  "priceAdjustment": 5000,
  "stockQuantity": 150
}
```

**Variant 3 - Large:**
```json
{
  "productId": "YOUR_PRODUCT_ID",
  "sku": "TSHIRT-L-BLACK",
  "variantName": "Large - Black",
  "priceAdjustment": 10000,
  "stockQuantity": 100
}
```

### 2.3 Publish Product

**Endpoint:** `PATCH /api/products/{id}/publish`

This changes status from `draft` to `active`.

### 2.4 Verify Product Created

**Endpoint:** `GET /api/products/{slug}`

Use slug: `premium-cotton-tshirt`

---

## Phase 3: Group Buying Flow

### 3.1 Create Group Buying Session

**Service:** Group Buying Service (http://localhost:3004/api-docs)

**Endpoint:** `POST /api/group-buying`

```json
{
  "productId": "YOUR_PRODUCT_ID",
  "factoryId": "YOUR_FACTORY_ID",
  "targetMoq": 100,
  "groupPrice": 140000,
  "priceTier25": 140000,
  "priceTier50": 130000,
  "priceTier75": 120000,
  "priceTier100": 110000,
  "endTime": "2025-11-27T23:59:59Z",
  "estimatedCompletionDate": "2025-12-10T00:00:00Z"
}
```

**Save the response:** Note `id` and `sessionCode`.

### 3.2 Get Session Details

**Endpoint:** `GET /api/group-buying/{id}`

Verify session status is `active` and current tier pricing.

### 3.3 Join Session (Multiple Participants)

**Endpoint:** `POST /api/group-buying/{id}/join`

**Participant 1 (25 units):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "quantity": 25,
  "variantId": "YOUR_VARIANT_ID",
  "unitPrice": 140000,
  "totalPrice": 3500000
}
```

**Participant 2 (25 units):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440003",
  "quantity": 25,
  "variantId": "YOUR_VARIANT_ID",
  "unitPrice": 140000,
  "totalPrice": 3500000
}
```

**Participant 3 (50 units) - Reaches MOQ:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440004",
  "quantity": 50,
  "variantId": "YOUR_VARIANT_ID",
  "unitPrice": 110000,
  "totalPrice": 5500000
}
```

### 3.4 Check Session Statistics

**Endpoint:** `GET /api/group-buying/{id}/stats`

Verify:
- `totalQuantity` = 100
- `currentTier` = 100
- `moqReached` = true

### 3.5 View All Participants

**Endpoint:** `GET /api/group-buying/{id}/participants`

---

## Phase 4: Order & Payment Flow

### 4.1 Create Bulk Orders from Session

**Service:** Order Service (http://localhost:3005/api-docs)

**Endpoint:** `POST /api/orders/bulk`

```json
{
  "groupSessionId": "YOUR_SESSION_ID"
}
```

This creates individual orders for each participant. **Save all order IDs.**

### 4.2 View Created Orders

**Endpoint:** `GET /api/orders?groupSessionId=YOUR_SESSION_ID`

Each order should have:
- Status: `pending_payment`
- `isGroupBuying`: true
- Correct pricing based on tier reached

### 4.3 Get Specific Order Details

**Endpoint:** `GET /api/orders/{id}`

### 4.4 Create Payment for Order

**Service:** Payment Service (http://localhost:3006/api-docs)

**Endpoint:** `POST /api/payments`

```json
{
  "orderId": "YOUR_ORDER_ID",
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "amount": 3500000,
  "paymentMethod": "bank_transfer",
  "isEscrow": true
}
```

Response includes:
- `paymentUrl` - Xendit checkout URL
- `paymentCode` - Unique payment code
- `isInEscrow` - true (for group buying)

**Repeat for all orders in the session.**

### 4.5 Simulate Payment Webhook

**Endpoint:** `POST /api/webhooks/xendit/invoice`

```json
{
  "id": "XENDIT_INVOICE_ID",
  "external_id": "YOUR_PAYMENT_CODE",
  "status": "PAID",
  "paid_at": "2025-11-20T15:30:00Z",
  "payment_method": "BANK_TRANSFER",
  "payment_channel": "BCA"
}
```

### 4.6 Verify Order Status Updated

**Endpoint:** `GET /api/orders/{id}`

Order status should be `paid`.

### 4.7 Release Escrow (After All Payments)

**Endpoint:** `POST /api/payments/release-escrow`

```json
{
  "groupSessionId": "YOUR_SESSION_ID"
}
```

---

## Phase 5: Logistics & Shipping

### 5.1 Get Shipping Rates

**Service:** Logistics Service (http://localhost:3011/api-docs)

**Endpoint:** `POST /api/rates`

```json
{
  "orderId": "YOUR_ORDER_ID",
  "originPostalCode": "40123",
  "destinationPostalCode": "12190",
  "couriers": ["jne", "jnt", "sicepat"]
}
```

Returns available couriers with rates.

### 5.2 Update Order with Shipping Cost

**Service:** Order Service (http://localhost:3005/api-docs)

**Endpoint:** `PUT /api/orders/{id}/shipping-cost`

```json
{
  "shippingCost": 50000,
  "taxAmount": 5000
}
```

### 5.3 Create Shipment

**Service:** Logistics Service (http://localhost:3011/api-docs)

**Endpoint:** `POST /api/shipments`

```json
{
  "orderId": "YOUR_ORDER_ID",
  "courierCompany": "jne",
  "courierType": "REG",
  "courierInsurance": 50000,
  "shipperContactName": "Laku Warehouse",
  "shipperContactPhone": "+6281234567890",
  "shipperOrganization": "Laku Platform",
  "originContactName": "Test Factory",
  "originContactPhone": "+6281234567890",
  "originAddress": "Jl. Industri No. 123",
  "originPostalCode": "40123",
  "destinationContactName": "John Doe",
  "destinationContactPhone": "+6281234567891",
  "destinationAddress": "Jl. Sudirman No. 45",
  "destinationPostalCode": "12190",
  "deliveryType": "now",
  "items": [
    {
      "name": "Premium Cotton T-Shirt",
      "quantity": 25,
      "weight": 200,
      "value": 110000
    }
  ]
}
```

**Save the `trackingNumber`.**

### 5.4 Track Shipment

**Endpoint:** `GET /api/shipments/track/{trackingNumber}`

### 5.5 Simulate Delivery Webhook

**Endpoint:** `POST /api/webhooks/biteship`

```json
{
  "event": "tracking.updated",
  "trackingId": "BITESHIP_TRACKING_ID",
  "status": "delivered",
  "courierTrackingId": "YOUR_TRACKING_NUMBER",
  "updatedAt": "2025-11-25T10:00:00Z"
}
```

### 5.6 Update Order Status to Delivered

**Service:** Order Service (http://localhost:3005/api-docs)

**Endpoint:** `PUT /api/orders/{id}/status`

```json
{
  "status": "delivered"
}
```

---

## Phase 6: Wallet Operations

### 6.1 Credit Wallet (Cashback/Refund)

**Service:** Wallet Service (http://localhost:3010/api-docs)

**Endpoint:** `POST /api/transactions/credit`

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "amount": 25000,
  "type": "cashback",
  "description": "Cashback for order ORD-20251120-00001",
  "referenceType": "order",
  "referenceId": "YOUR_ORDER_ID"
}
```

### 6.2 Check Wallet Balance

**Endpoint:** `GET /api/balance/{userId}`

### 6.3 Request Withdrawal

**Endpoint:** `POST /api/withdrawals/request`

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "amount": 20000,
  "bankCode": "BCA",
  "bankName": "Bank Central Asia",
  "accountNumber": "1234567890",
  "accountName": "John Doe"
}
```

### 6.4 Process Batch Withdrawals (CRON)

**Endpoint:** `POST /api/withdrawals/process-batch`

This processes all pending withdrawals via Xendit disbursement.

### 6.5 Simulate Disbursement Webhook

**Endpoint:** `POST /api/webhooks/xendit/disbursement`

```json
{
  "id": "XENDIT_DISBURSEMENT_ID",
  "external_id": "WITHDRAWAL_ID",
  "status": "COMPLETED",
  "amount": 20000
}
```

---

## Phase 7: Settlement

### 7.1 Get Eligible Payments for Settlement

**Service:** Payment Service (http://localhost:3006/api-docs)

**Endpoint:** `POST /api/payments/eligible-for-settlement`

```json
{
  "factoryId": "YOUR_FACTORY_ID",
  "periodStart": "2025-11-01T00:00:00Z",
  "periodEnd": "2025-11-30T23:59:59Z"
}
```

### 7.2 Create Factory Settlement

**Service:** Settlement Service (http://localhost:3013/api-docs)

**Endpoint:** `POST /api/settlements`

```json
{
  "factoryId": "YOUR_FACTORY_ID",
  "periodStart": "2025-11-01T00:00:00Z",
  "periodEnd": "2025-11-30T23:59:59Z",
  "totalAmount": 5000000,
  "platformFee": 250000,
  "netAmount": 4750000
}
```

### 7.3 Process Settlement

**Endpoint:** `PATCH /api/settlements/{id}/process`

---

## CRON Job Testing

### Session Expiration Processing

**Service:** Group Buying Service (http://localhost:3004/api-docs)

#### Test Near-Expiration (Bot Join)

**Endpoint:** `POST /api/group-buying/process-near-expiration`

Triggers bot participant logic for sessions within 10 minutes of expiration that haven't reached 25% of MOQ.

#### Test Expired Sessions

**Endpoint:** `POST /api/group-buying/process-expired`

Processes sessions past their end time:
- If MOQ reached → Status becomes `success`
- If MOQ not reached → Status becomes `failed`, triggers refunds

#### Manual Expire (Testing Only)

**Endpoint:** `POST /api/group-buying/{id}/manual-expire`

Manually expires a session for testing purposes.

---

## Webhook Testing

### Using Webhook Tester Tools

1. **ngrok** - Expose local services:
   ```bash
   ngrok http 3006  # For payment webhooks
   ngrok http 3011  # For logistics webhooks
   ```

2. **Webhook.site** - Test webhook payloads

3. **Postman** - Manual webhook simulation

### Payment Webhook Test Cases

| Status | Expected Behavior |
|--------|-------------------|
| `PAID` | Order status → `paid`, escrow held |
| `EXPIRED` | Order status → `failed` |
| `FAILED` | Order status → `failed` |

### Logistics Webhook Test Cases

| Status | Expected Behavior |
|--------|-------------------|
| `picked_up` | Shipment tracking updated |
| `in_transit` | Shipment tracking updated |
| `delivered` | Order eligible for settlement |

---

## Sample Test Data

### Test User IDs

```
User 1: 550e8400-e29b-41d4-a716-446655440001 (Factory Owner)
User 2: 550e8400-e29b-41d4-a716-446655440002 (Customer)
User 3: 550e8400-e29b-41d4-a716-446655440003 (Customer)
User 4: 550e8400-e29b-41d4-a716-446655440004 (Customer)
Admin:  550e8400-e29b-41d4-a716-446655440099
```

### Test Factory Data

```json
{
  "factoryName": "Textile Factory Bandung",
  "factoryCode": "FACT-BDG-TST-202411",
  "verificationStatus": "verified"
}
```

### Test Product Pricing (Tiered)

| Tier | Quantity % | Price/Unit |
|------|------------|------------|
| 25% | 25 units | Rp 140,000 |
| 50% | 50 units | Rp 130,000 |
| 75% | 75 units | Rp 120,000 |
| 100% | 100 units | Rp 110,000 |

### Test Bank Codes (Indonesia)

```
BCA - Bank Central Asia
BNI - Bank Negara Indonesia
BRI - Bank Rakyat Indonesia
MANDIRI - Bank Mandiri
CIMB - CIMB Niaga
```

---

## Complete E2E Test Checklist

### Happy Path: Group Buying Success

- [ ] Create and verify factory
- [ ] Create category
- [ ] Create product with variants
- [ ] Publish product
- [ ] Create group buying session
- [ ] Join session (multiple users to reach MOQ)
- [ ] Create bulk orders from session
- [ ] Create payments for all orders
- [ ] Simulate payment webhooks (all paid)
- [ ] Release escrow
- [ ] Update session to production started
- [ ] Update session to production completed
- [ ] Get shipping rates
- [ ] Create shipments
- [ ] Simulate delivery webhooks
- [ ] Update orders to delivered
- [ ] Credit wallets (cashback)
- [ ] Request withdrawals
- [ ] Process batch withdrawals
- [ ] Create factory settlement

### Failure Path: MOQ Not Reached

- [ ] Create group buying session
- [ ] Join session (partial quantity)
- [ ] Trigger session expiration
- [ ] Verify automatic refund processing
- [ ] Check wallet credits for refunds
- [ ] Verify session status = `failed`

### Edge Cases to Test

- [ ] Variant availability check during join
- [ ] Duplicate webhook handling (idempotency)
- [ ] Insufficient wallet balance for withdrawal
- [ ] Cancel order before payment
- [ ] Leave group session before orders created

---

## Troubleshooting

### Common Issues

1. **"Service not available"**
   - Check if service is running on correct port
   - Verify database connection

2. **"Payment creation failed"**
   - Verify Xendit API keys
   - Check order exists and is pending

3. **"Cannot join session"**
   - Check session status is `active`
   - Verify variant availability
   - Check allocation limits

4. **"Webhook not received"**
   - Verify ngrok is running
   - Check webhook URL configuration in Xendit/Biteship dashboard

### Log Locations

Each service logs to console by default. Check terminal output for detailed error messages.

---

## Notes

- **Auth/Security**: User authentication is handled separately. Use test user IDs directly for testing.
- **Idempotency**: Webhooks use `webhook_events` table to prevent duplicate processing.
- **Escrow**: All group buying payments are held in escrow until MOQ is reached and session succeeds.
- **Bot Participants**: Platform bot auto-joins sessions near expiration to help reach MOQ.

---

*Last Updated: November 2025*
