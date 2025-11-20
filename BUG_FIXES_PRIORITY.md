# BUG FIX PRIORITY GUIDE

## 🔴 CRITICAL - Fix Immediately (Core Functionality Broken)

### Bug #1: Logistics Service - Tracking Parameter Mismatch
- **File:** `services/logistics-service/src/controllers/logistics.controller.ts:92-93`
- **Quick Fix:** Change `getTracking(trackingNumber)` to find shipment by tracking number first
- **Code Location:** `/home/user/ecommerce-stable/services/logistics-service/src/services/logistics.service.ts:268`
- **Why Critical:** Users cannot track shipments at all - breaks core feature

```typescript
// BEFORE (BROKEN)
async getTracking(shipmentId: string) {
    const shipment = await this.repository.findById(shipmentId);  // Wrong!
}

// AFTER (FIXED)
async getTracking(trackingNumber: string) {
    const shipment = await this.repository.findByTrackingNumber(trackingNumber);  // Correct!
}
```

---

### Bug #2: Warehouse Service - Null String Conversion
- **File:** `services/warehouse-service/src/repositories/warehouse.repository.ts:10`
- **Quick Fix:** Remove string conversion for null values
- **Why Critical:** Inventory lookup fails for all products without variants

```typescript
// BEFORE (BROKEN)
variant_id: variantId || "null"  // Converts null to string "null"

// AFTER (FIXED)
variant_id: variantId ?? null  // Preserves actual null
```

---

## 🟠 HIGH - Fix Urgently (Logic Errors)

### Bug #3: Logistics Service - Webhook Crashes
- **File:** `services/logistics-service/src/services/logistics.service.ts:290`
- **Issue:** References undefined variable `biteshipTracking` in webhook handler
- **Quick Fix:** Change `biteshipTracking.history[0]?.updated_at` to `payload.history[0]?.updated_at`
- **Why Urgent:** Webhooks completely broken - shipment updates fail

---

### Bug #4: Wallet Service - Incomplete Withdrawal Validation
- **File:** `services/wallet-service/src/services/wallet.service.ts:45-48`
- **Issue:** Only checks `amount > WITHDRAWAL_FEE` but should also check `amount >= 10000`
- **Quick Fix:** Call validation utility functions defined in `withdrawal.ts`
- **Why Urgent:** Users can withdraw uneconomical amounts like 2,501 IDR

```typescript
// BEFORE (INCOMPLETE)
if (data.amount <= WITHDRAWAL_FEE) throw new Error(...);

// AFTER (COMPLETE)
const validation = validateWithdrawalAmount(data.amount, wallet.balance);
if (!validation.valid) throw new Error(validation.error);
```

---

### Bug #5: Warehouse Service - Unused Utility Code
- **File:** `services/warehouse-service/src/utils/bundleCalculation.ts`
- **Issue:** Functions defined but never used in service; service uses different logic
- **Quick Fix:** Either integrate utilities into service OR remove dead code
- **Why Urgent:** Confusing codebase, unclear if tolerance feature works

---

## 🟡 MEDIUM - Fix Important (Data Inconsistencies)

### Bug #6: Wallet Service - Batch Withdrawal Idempotency
- **File:** `services/wallet-service/src/services/wallet.service.ts:105-236`
- **Issue:** No protection against processing same withdrawal twice if cron runs concurrently
- **Quick Fix:** Update status to 'processing' BEFORE making Xendit API call
- **Why Important:** Could result in duplicate payouts

---

### Bug #7: Warehouse Service - Inconsistent Stock Property Naming
- **File:** `services/warehouse-service/src/services/warehouse.service.ts`
- **Issue:** `fulfillBundleDemand` uses `inventory?.quantity` while `fulfillDemand` uses `inventory?.available_quantity`
- **Fix:** Use consistent property name across both methods
- **Why Important:** Logic inconsistency between related methods

---

### Bug #8: Logistics Service - Missing API Response Validation
- **File:** `services/logistics-service/src/services/logistics.service.ts:281-291`
- **Issue:** No validation that `biteshipTracking.history` exists before accessing
- **Quick Fix:** Add null checks: `biteshipTracking?.history?.[0]?.updated_at`
- **Why Important:** Could create Invalid Date objects in database

---

## 📋 Testing Recommendations

After fixes, test these scenarios:

### For Bug #1 (Tracking):
```bash
# Test tracking shipment by tracking number
GET /api/shipments/track/JNE12345678901
# Should return shipment details, not 404
```

### For Bug #2 (Warehouse):
```bash
# Test fulfilling demand for product without variant
POST /api/fulfill-demand
{
  "productId": "uuid-of-variant-less-product",
  "variantId": null,
  "quantity": 100,
  "wholesaleUnit": 10
}
# Should find inventory correctly
```

### For Bug #3 (Webhook):
```bash
# Test webhook processing
POST /api/webhooks/biteship
{
  "status": "on_transit",
  "history": [{ "note": "Picked up", "updated_at": "2024-01-20T10:00:00Z" }],
  ...
}
# Should not crash with ReferenceError
```

### For Bug #4 (Withdrawal):
```bash
# Test minimum withdrawal amount
POST /api/withdrawals/request
{ "amount": 2501, ... }  // Less than minimum 10,000
# Should reject with validation error
```

### For Bug #6 (Batch):
```bash
# Run batch processor twice concurrently
# Check that withdrawals are only processed once
# Check database for duplicate transactions
```

---

## Estimated Fix Time

| Severity | Count | Est. Time |
|----------|-------|-----------|
| CRITICAL | 2 | 1-2 hours |
| HIGH | 4 | 2-3 hours |
| MEDIUM | 8 | 3-4 hours |
| LOW | 2 | 1-2 hours |
| **TOTAL** | **16** | **7-11 hours** |

---

## Files to Review After Fixes

- [ ] `services/logistics-service/src/services/logistics.service.ts` - Tracking logic
- [ ] `services/warehouse-service/src/repositories/warehouse.repository.ts` - Inventory queries
- [ ] `services/wallet-service/src/services/wallet.service.ts` - Withdrawal validation
- [ ] `services/logistics-service/src/controllers/logistics.controller.ts` - Webhook handling
- [ ] Integration tests for cross-service calls

