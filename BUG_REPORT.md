# COMPREHENSIVE BUG REPORT - E-COMMERCE MICROSERVICES

## CRITICAL BUGS

### 1. LOGISTICS SERVICE - Parameter Type Mismatch in getTracking()
**Severity:** CRITICAL - Logic Error
**File:** `/home/user/ecommerce-stable/services/logistics-service/src/controllers/logistics.controller.ts` (Line 92-93)
**Also:** `/home/user/ecommerce-stable/services/logistics-service/src/services/logistics.service.ts` (Line 268)

**Issue:**
The controller passes a `trackingNumber` to the service, but the service method expects a `shipmentId`:
```typescript
// Controller (Line 92-93)
const { trackingNumber } = req.params;
const tracking = await service.getTracking(trackingNumber);  // WRONG!

// Service (Line 268)
async getTracking(shipmentId: string) {
    const shipment = await this.repository.findById(shipmentId);  // Tries to find by ID but receives tracking number
```

**Impact:**
- Tracking API will fail because tracking numbers are not shipment IDs
- `findById()` will return null for tracking number input
- Users cannot track shipments using tracking numbers

**Fix:** The service should use `findByTrackingNumber()` or the method signature should be clarified.

---

### 2. WAREHOUSE REPOSITORY - Null String Conversion Bug
**Severity:** HIGH - Data Integrity
**File:** `/home/user/ecommerce-stable/services/warehouse-service/src/repositories/warehouse.repository.ts` (Line 10)

**Issue:**
```typescript
async findInventory(productId: string, variantId: string | null) {
    return prisma.warehouse_inventory.findUnique({
        where: {
            product_id_variant_id: {
                product_id: productId,
                variant_id: variantId || "null",  // BUG: Converts null to string "null"
            }
        }
    });
}
```

**Impact:**
- Products without variants cannot be found correctly
- Queries will look for literal string `"null"` instead of database NULL value
- Inventory lookups will fail for all products without variants
- Race condition: Stock calculations may be completely wrong

**Example Scenario:**
```
Product A has NO variant (variantId = null)
Query looks for: variant_id = "null" (string)
Database has: variant_id = NULL
Result: findInventory() returns null/undefined
Consequences: fulfillDemand() reports "Sufficient stock in warehouse" when inventory doesn't exist
```

---

### 3. LOGISTICS SERVICE - Parameter Validation Gap
**Severity:** HIGH - Missing Validation
**File:** `/home/user/ecommerce-stable/services/logistics-service/src/controllers/logistics.controller.ts` (Line 90-106)

**Issue:**
```typescript
export async function trackShipment(req: Request, res: Response) {
    // No validation that trackingNumber exists
    const { trackingNumber } = req.params;
    const tracking = await service.getTracking(trackingNumber);  // Could be undefined/null
```

The route accepts any string as trackingNumber with no validation.

**Impact:**
- Invalid tracking numbers cause cryptic error messages
- No input sanitization for tracking number

---

## HIGH SEVERITY BUGS

### 4. WALLET SERVICE - Incomplete Withdrawal Validation
**Severity:** HIGH - Logic Error
**File:** `/home/user/ecommerce-stable/services/wallet-service/src/services/wallet.service.ts` (Line 45-48)

**Issue:**
```typescript
async requestWithdrawal(data: WithdrawalRequestDTO) {
    if (data.amount <= WITHDRAWAL_FEE) {  // Only checks against fee
        throw new Error(`Withdrawal amount must be greater than...`);
    }
```

The service only validates `amount > WITHDRAWAL_FEE`, but the utility functions in `withdrawal.ts` define additional validation:
- Minimum withdrawal: 10,000 IDR (Line 20-21 in withdrawal.ts)
- Net amount must be positive (Line 28-31 in withdrawal.ts)

**Problem:** The validation utility functions are NEVER CALLED in the service!

**Impact:**
- User could request withdrawal of 2,501 (> fee of 2,500) → Passes service validation
- But would result in net amount of just 1 IDR → Uneconomical and potentially violates business rules
- The validation functions in `withdrawal.ts` are defined but unused (dead code)

**Evidence:**
- File: `/home/user/ecommerce-stable/services/wallet-service/src/utils/withdrawal.ts` defines:
  - `validateWithdrawalAmount()` (Line 12-34)
  - `validateBankDetails()` (Line 60-90)
- But grep shows these are NEVER imported or called in wallet.service.ts

---

### 5. WAREHOUSE SERVICE - Unused/Misused Bundle Calculation Utility
**Severity:** HIGH - Dead Code / Potential Logic Mismatch
**File:** `/home/user/ecommerce-stable/services/warehouse-service/src/utils/bundleCalculation.ts` (Lines 3-39)

**Issue:**
The bundleCalculation utility functions are defined but NEVER USED in the actual service:

```typescript
// bundleCalculation.ts - UNUSED
export function calculateBundlesNeeded(
    quantity: number,
    bundleSize: number,
    tolerancePercentage: number  // Takes tolerance PERCENTAGE
): number {
    const tolerance = (tolerancePercentage / 100) * bundleSize;
    const adjustedQuantity = quantity + tolerance;
    return Math.ceil(adjustedQuantity / bundleSize);
}

// warehouse.service.ts - DIFFERENT IMPLEMENTATION (Lines 155-156)
const bundlesNeeded = Math.ceil(quantity / unitsPerBundle);  // Simple calculation without tolerance
const totalUnitsToOrder = bundlesNeeded * unitsPerBundle;
```

**Impact:**
- The tolerance percentage feature is not implemented
- Utility functions are dead code
- Confusing for maintainers - unclear which calculation is correct
- If the utility functions ARE intended to be used, the warehouse service has the wrong logic

---

### 6. LOGISTICS SERVICE - Unsafe Webhook Payload Access
**Severity:** HIGH - Error Handling Gap
**File:** `/home/user/ecommerce-stable/services/logistics-service/src/services/logistics.service.ts` (Lines 288-290)

**Issue:**
```typescript
async handleBiteshipWebhook(payload: any) {
    // ...
    await this.updateShipmentStatus({
        shipmentId: shipment.id,
        status: internalStatus,
        description: payload.history?.[0]?.note || 'Status updated from webhook',
        location: payload.history?.[0]?.service_type,
        eventTime: new Date(biteshipTracking.history[0]?.updated_at)  // BUG: Uses biteshipTracking, not payload
    });
```

On line 290, `biteshipTracking.history[0]?.updated_at` is used, but:
- The variable is `payload`, not `biteshipTracking`
- This is the webhook handler, there's no `biteshipTracking` variable in scope
- This will throw a ReferenceError

**Impact:**
- Webhook processing will crash
- Shipment status updates via webhook will fail
- No error handling for malformed payloads

---

### 7. SETTLEMENT SERVICE - Logic Issue in Next Settlement Date
**Severity:** MEDIUM - Logic Concern
**File:** `/home/user/ecommerce-stable/services/settlement-service/src/utils/settlement.ts` (Lines 92-106)

**Note:** After careful analysis, the logic is ACTUALLY CORRECT. The function properly calculates the next Friday that is at least 7 days away. No fix needed, but documentation could be clearer.

---

### 8. WALLET SERVICE - Missing Batch Processing Idempotency
**Severity:** MEDIUM - Concurrency Issue
**File:** `/home/user/ecommerce-stable/services/wallet-service/src/services/wallet.service.ts` (Lines 105-236)

**Issue:**
The `processBatchWithdrawals()` method has no idempotency protection:

```typescript
async processBatchWithdrawals() {
    const pendingWithdrawals = await prisma.wallet_withdrawals.findMany({
        where: { status: 'pending' }  // No lock mechanism
    });
    
    for (const withdrawal of pendingWithdrawals) {
        // If cron job runs twice concurrently, same withdrawal will be processed twice
        // Status is only updated AFTER Xendit call (Line 164-170)
```

**Problem:** The withdrawal status is `pending` until AFTER the Xendit API call succeeds. If:
1. CRON job starts processing withdrawal A (status still 'pending')
2. CRON job runs again concurrently
3. Both will try to process withdrawal A
4. Xendit will receive two disbursement requests for the same amount
5. Potential duplicate payouts

**Impact:**
- Double payouts to users
- Financial loss
- Reconciliation issues

**Fix:** Lock the record or update status BEFORE making external API call.

---

### 9. WAREHOUSE SERVICE - Missing Null Check for Current Stock
**Severity:** MEDIUM - Potential NPE
**File:** `/home/user/ecommerce-stable/services/warehouse-service/src/services/warehouse.service.ts` (Line 26)

**Issue:**
```typescript
async fulfillDemand(data: FulfillDemandDTO) {
    const inventory = await this.repository.findInventory(productId, variantId || null);
    const currentStock = inventory?.available_quantity || 0;  // Falls back to 0
    
    if (currentStock >= quantity) {
        // ... reserves stock
        if (!inventory) {  // BUG: Checks inventory AFTER using it
            throw new Error('Inventory record not found');
        }
```

The code uses `inventory?.available_quantity` (which could create an inventory = undefined), but later checks `if (!inventory)` and throws an error. However, if the check is false, `inventory.id` on line 52 would throw.

More critically: If inventory doesn't exist, `currentStock` becomes 0, which is correct logic. But the check on line 35 should come BEFORE using inventory.

**Impact:**
- Confusing error handling
- Potential null pointer exception if inventory is null but somehow passes the quantity check

---

### 10. LOGISTICS SERVICE - Unsafe Tracking API Response Processing
**Severity:** MEDIUM - Missing Validation
**File:** `/home/user/ecommerce-stable/services/logistics-service/src/services/logistics.service.ts` (Lines 281-291)

**Issue:**
```typescript
const biteshipTracking = await biteshipAPI.trackOrder(biteshipOrderId);

if (biteshipTracking.status && biteshipTracking.status !== shipment.status) {
    const mappedStatus = this.mapBiteshipStatus(biteshipTracking.status);
    // ...
    eventTime: new Date(biteshipTracking.history[0]?.updated_at)  // BUG!
}

return biteshipTracking as TrackingInfo;  // Returns without validation
```

**Problems:**
1. `biteshipTracking.history` might be empty or undefined
2. `new Date(undefined)` creates an Invalid Date object
3. No validation that biteshipTracking has expected structure

**Impact:**
- Invalid Date objects in tracking events
- Silent failures that are hard to debug
- Type casting with `as TrackingInfo` hides potential type mismatches

---

## MEDIUM SEVERITY ISSUES

### 11. WAREHOUSE SERVICE - Inconsistent Stock Property Naming
**Severity:** MEDIUM - Code Quality/Confusion
**File:** `/home/user/ecommerce-stable/services/warehouse-service/src/services/warehouse.service.ts` (Line 171)

**Issue:**
In `fulfillBundleDemand()`:
```typescript
const inventory = await this.repository.findInventory(productId, variantId || null);
const currentStock = inventory?.quantity || 0;  // Uses "quantity"
const availableStock = inventory?.available_quantity || 0;  // Uses "available_quantity"
```

But in `fulfillDemand()`:
```typescript
const currentStock = inventory?.available_quantity || 0;  // Only uses "available_quantity"
```

The database schema should have a single, consistent property name for available stock across both methods.

**Impact:**
- Logic inconsistency between fulfillDemand and fulfillBundleDemand
- If a property doesn't exist on some inventory objects, one method will work and the other will fail
- Confusing for maintainers

---

### 12. LOGISTICS SERVICE - Missing Shipment Status Check
**Severity:** MEDIUM - Business Logic
**File:** `/home/user/ecommerce-stable/services/logistics-service/src/services/logistics.service.ts` (Line 123)

**Issue:**
```typescript
if (order.status !== 'ready_for_pickup' && order.status !== 'picked_up' && 
    order.status !== 'paid' && order.status !== 'processing') {
    throw new Error(`Cannot create shipment for order with status: ${order.status}`);
}
```

The condition allows 'paid' and 'processing' statuses, which may be incorrect. Typically:
- Shipments should only be created for orders that have completed payment processing and are ready
- 'paid' might be too early in the order lifecycle

**Impact:**
- Shipments created for unprepared orders
- Logistics confusion if products aren't actually ready to ship

---

### 13. WALLET SERVICE - Route Validation Inconsistency
**Severity:** LOW - Input Validation
**File:** `/home/user/ecommerce-stable/services/wallet-service/src/routes/wallet.routes.ts` (Lines 98-105)

**Issue:**
The credit transaction route validates `amount` as Float with `gt: 0`, but the withdrawal route (Line 151) also validates as Float. However:

```typescript
body('amount').isFloat({ gt: 0 }),  // Must be > 0
```

Amounts in financial systems should be:
1. Positive integers (most systems use cents/smallest unit)
2. Have maximum precision validation
3. Check for reasonable maximum values

**Impact:**
- Floating point precision errors possible
- No maximum limit on withdrawal amounts
- Amounts like 0.0001 could theoretically be processed

---

### 14. LOGISTICS SERVICE - Missing Error Context in Refund
**Severity:** LOW - Error Handling
**File:** `/home/user/ecommerce-stable/services/wallet-service/src/services/wallet.service.ts` (Lines 178-187)

**Issue:**
```typescript
const errorMessage = error.response?.data?.message || error.message;  // Might be truncated
```

If error.response?.data?.message is very long, it's stored in `failed_reason` without truncation. Database column might have length limits.

**Impact:**
- Database errors if message is too long
- Incomplete error information stored

---

## SUMMARY TABLE

| # | Service | Severity | Type | Issue |
|---|---------|----------|------|-------|
| 1 | Logistics | CRITICAL | Logic Error | getTracking() parameter mismatch |
| 2 | Warehouse | CRITICAL | Data Integrity | Null string conversion in findInventory |
| 3 | Logistics | HIGH | Validation Gap | No parameter validation for tracking |
| 4 | Wallet | HIGH | Logic Error | Incomplete withdrawal validation |
| 5 | Warehouse | HIGH | Dead Code | Unused bundle calculation utilities |
| 6 | Logistics | HIGH | Error Handling | Unsafe webhook payload access |
| 7 | Wallet | MEDIUM | Concurrency | Missing batch processing idempotency |
| 8 | Warehouse | MEDIUM | NPE Risk | Inconsistent null check ordering |
| 9 | Logistics | MEDIUM | Validation Gap | Missing tracking response validation |
| 10 | Warehouse | MEDIUM | Code Quality | Inconsistent stock property naming |
| 11 | Logistics | MEDIUM | Business Logic | Unclear order status requirements |
| 12 | Wallet | LOW | Input Validation | Float precision concerns |
| 13 | Wallet | LOW | Error Handling | Missing error message truncation |

---

## RECOMMENDATIONS

1. **Immediate (Critical):** Fix bugs #1 and #2 - they break core functionality
2. **Urgent (High):** Fix bugs #3, #4, #5, #6 - they cause logic failures  
3. **Important (Medium):** Fix bugs #7, #8, #9, #10, #11 - they cause data inconsistencies
4. **Nice-to-have (Low):** Fix bugs #12, #13 - they improve robustness

