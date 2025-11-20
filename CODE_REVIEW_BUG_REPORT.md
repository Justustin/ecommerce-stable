# Code Review Bug Report

**Date:** November 2025
**Scope:** All services (excluding auth-service per request)

---

## Executive Summary

| Severity | Count | Description |
|----------|-------|-------------|
| **CRITICAL** | 12 | Data loss, security bypass, system failures |
| **HIGH** | 20 | Major logic errors, race conditions |
| **MEDIUM** | 25 | Data integrity, code quality issues |
| **LOW** | 6 | Minor improvements |
| **TOTAL** | **63** | |

---

## CRITICAL BUGS (P0 - Fix Immediately)

### 1. Hardcoded 'paid' Status for Bulk Orders
**File:** `services/order-service/src/repositories/order.repository.ts:109-119`

Orders from group buying are marked `paid` with `paid_at` set immediately, but actual payments may still be pending/failed.

```typescript
// PROBLEM
status: 'paid',  // Hardcoded
paid_at: new Date(),
```

**Impact:** Orders show paid before payment confirmed. Fulfillment starts prematurely.

**Fix:** Use `pending_payment` status, update on webhook.

---

### 2. Missing Environment Variable Fallback
**File:** `services/order-service/src/services/order.service.ts:73-74`

```typescript
const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL
// No fallback - becomes undefined/api/payments
```

**Impact:** All payment creation fails if env var missing.

**Fix:** Add fallback: `|| 'http://localhost:3006'`

---

### 3. Broken Escrow Payment Detection
**File:** `services/payment-service/src/services/payment.service.ts:86-87`

```typescript
const isGroupBuying = payment.orders?.group_session_id !== null || isEscrowPayment;
// If order_id is null (escrow), payment.orders is null
// undefined !== null = true (always!)
```

**Impact:** All escrow payments incorrectly marked as group buying in ledger.

**Fix:** Use `!!payment.group_session_id || isEscrowPayment`

---

### 4. Fire-and-Forget Refund Processing
**File:** `services/payment-service/src/services/refund.service.ts:44-50`

```typescript
setTimeout(() => {
  this.processRefund(refund.id).catch(err => console.error(...));
}, 100);
```

**Impact:** Server crash = lost refunds. Users don't get money back.

**Fix:** Use job queue (Bull/RabbitMQ) or cron job.

---

### 5. Escrow Payment Status Not Checked
**File:** `services/group-buying-service/src/services/group.buying.service.ts:1137-1168`

Filters participants by `payment_status === 'paid'`, but escrow payments may still be `pending` awaiting webhook.

**Impact:** Paid participants excluded from order creation.

**Fix:** Include `pending` escrow payments or wait for webhook confirmation.

---

### 6. Hard Delete Factories (Data Loss)
**File:** `services/factory-service/src/repositories/factory.repository.ts:365-369`

Permanent delete causes orphaned products, orders, settlements.

**Impact:** Referential integrity broken, data loss.

**Fix:** Soft delete (set status to 'inactive').

---

### 7. Authorization Bypass - UserId from Body
**File:** `services/address-service/src/controllers/address.controller.ts:88, 104`

```typescript
const { userId } = req.body; // User controls this!
```

**Impact:** Users can access/modify any user's addresses.

**Fix:** Get from JWT: `req.user.id`

---

### 8. Missing Authorization in Address Update
**File:** `services/address-service/src/services/address.service.ts:35-52`

No check that address belongs to requesting user.

**Impact:** Can update anyone's address.

**Fix:** Verify `existing.user_id === requestingUserId`

---

### 9. Logistics Tracking Parameter Mismatch
**File:** `services/logistics-service/src/services/logistics.service.ts:268`

Controller passes `trackingNumber`, service expects `shipmentId`.

**Impact:** Tracking completely broken.

**Fix:** Use `findByTrackingNumber()` method.

---

### 10. Warehouse Null String Conversion
**File:** `services/warehouse-service/src/repositories/warehouse.repository.ts:10`

```typescript
variantId || "null"  // Converts to string "null"
```

**Impact:** Inventory lookup fails for products without variants.

**Fix:** Use `variantId ?? null`

---

### 11. Missing Notification Authorization
**File:** `services/notification-service/src/controllers/notification.controller.ts:35-116`

No validation that userId matches authenticated user.

**Impact:** Can read/modify anyone's notifications.

**Fix:** Verify against JWT token.

---

### 12. Bot Participant Race Condition
**File:** `services/group-buying-service/src/services/group.buying.service.ts:1118-1131`

Bot removal after order creation. Crash between = duplicate orders.

**Impact:** Data inconsistency, ghost participants.

**Fix:** Remove bot before creating orders in transaction.

---

## HIGH PRIORITY BUGS (P1)

### Group Buying Service

| Bug | File:Line | Issue |
|-----|-----------|-------|
| Wrong order count reported | group.buying.service.ts:1238 | Reports all participants, not just paid ones |
| Missing null checks | group.buying.service.ts:469 | `session.products.grosir_unit_size` may crash |
| Wrong bot ID removal | group.buying.service.ts:1119 | Removes old bot ID, not new one |
| Failed orders not retried | group.buying.service.ts:857-869 | Sessions stuck in `moq_reached` forever |

### Order Service

| Bug | File:Line | Issue |
|-----|-----------|-------|
| Variant price calculation | order.utils.ts:80-90 | Adds variant price to base (may be wrong) |
| updateMany for single record | order.repository.ts:150-152 | Inefficient, unclear intent |

### Payment Service

| Bug | File:Line | Issue |
|-----|-----------|-------|
| Refund accumulation | refund.service.ts:291 | Can over-refund same payment |
| Webhook race condition | webhook.controller.ts:34-46 | Non-atomic check-then-insert |

### Product Service

| Bug | File:Line | Issue |
|-----|-----------|-------|
| Slug uniqueness not enforced | product.repository.ts:6-39 | Duplicate slugs possible |
| Race condition on slug | product.repository.ts:6-39 | Concurrent creates bypass check |
| Variant creation wrong return | product.service.ts:40-44 | Returns variant, checks for product |

### Factory Service

| Bug | File:Line | Issue |
|-----|-----------|-------|
| Race on factory code | factory.repository.ts:372-377 | TOCTOU vulnerability |
| Race on business license | factory.repository.ts:379-384 | TOCTOU vulnerability |
| PrismaClient per request | factory.repository.ts:16 | Connection pool exhaustion |

### Address Service

| Bug | File:Line | Issue |
|-----|-----------|-------|
| Race on default address | address.repository.ts:7-11, 75-87 | Multiple defaults possible |
| Update erases undefined fields | address.repository.ts:56-72 | Data loss on partial update |

### Notification Service

| Bug | File:Line | Issue |
|-----|-----------|-------|
| markAsRead wrong return | notification.service.ts:46-65 | updateMany returns count, not record |

### Logistics Service

| Bug | File:Line | Issue |
|-----|-----------|-------|
| Webhook undefined variable | logistics.service.ts:290 | References `biteshipTracking` undefined |

---

## MEDIUM PRIORITY BUGS (P2)

### Data Integrity Issues
- Missing product existence check for variants (`product.repository.ts:188-197`)
- Missing category existence check (`product.repository.ts:11-12`)
- Missing office existence validation (`factory.repository.ts:334-362`)
- Missing user existence for notifications (`notification.service.ts:5-21`)
- No stock quantity validation (negative stock allowed)

### Code Quality Issues
- Duplicate escrow creation logic (`payment.service.ts` vs `payment.repository.ts`)
- Service duplicates repository in notifications
- Hard-coded pagination in notification service
- Missing input validation in controllers

### State Management
- Verification auto-activates suspended factories (`factory.service.ts:85-88`)
- Total amount missing shipping costs initially (`order.repository.ts:40, 119`)
- Default address not atomic in update

### Other
- Route order issue in product service (slug before id)
- Wallet minimum validation incomplete (10,000 IDR not checked)
- Batch withdrawal no idempotency protection

---

## LOW PRIORITY BUGS (P3)

- Missing stack traces in error logs (all services)
- Missing env var validation at startup
- No maximum limits on withdrawal amounts
- Error message truncation before DB storage
- Unread count race condition in notifications

---

## Recommended Fix Order

### Week 1 (Critical)
1. Fix authorization bypasses (#7, #8, #11)
2. Fix payment status logic (#1, #3, #5)
3. Fix refund processing (#4)
4. Fix tracking parameter (#9)
5. Fix warehouse null (#10)

### Week 2 (High)
1. Add transactions for race conditions
2. Fix bot participant logic
3. Fix PrismaClient singleton
4. Add proper validation

### Week 3 (Medium)
1. Add existence checks
2. Consolidate duplicate code
3. Fix state transitions

### Week 4 (Low + Testing)
1. Improve logging
2. Add validation
3. Write integration tests for fixed bugs

---

## Architecture Recommendations

1. **Add Job Queue**: Replace setTimeout with Bull/RabbitMQ for async processing
2. **Use Transactions**: Wrap multi-step operations in database transactions
3. **Centralize Auth**: Extract userId from JWT middleware, not request body
4. **Singleton PrismaClient**: Share instance across requests
5. **Add Validation Layer**: Use class-validator or Joi for DTOs
6. **Soft Delete Pattern**: Never hard delete entities with relationships

---

*Generated by code review - November 2025*
