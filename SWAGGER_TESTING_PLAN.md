# Group Buying Overflow Logic - Manual Testing Plan (Swagger UI)

This guide walks you through testing the complete group buying flow manually using Swagger UI.

## 🎯 Testing Objective

Validate that the bundle overflow logic correctly locks/unlocks variants based on warehouse inventory levels.

**Test Scenario:**
- Bundle: 4S + 4M + 4L (12 units total)
- Max Stock: 8 units per variant
- Initial Inventory: S=8, M=0, L=8
- **Expected**: Small ✅ unlocked, Medium 🔒 locked, Large ✅ unlocked

---

## 📋 Prerequisites

### 1. Start Services
```bash
pnpm dev
```

Services should be running at:
- **Warehouse Service**: http://localhost:3003
- **Group Buying Service**: http://localhost:3002

### 2. Access Swagger UI
- Warehouse Service: http://localhost:3003/api-docs
- Group Buying Service: http://localhost:3002/api-docs

### 3. Set Up Test Data

Run this SQL to create test data:

```sql
-- Connect to your database and run setup-test-data.sql
-- Or manually run the SQL below:

-- This will create a product with S/M/L variants, bundle composition, and inventory
-- Copy the IDs printed at the end - you'll need them!
```

**Or use the provided SQL file:**
```bash
psql $DATABASE_URL -f setup-test-data.sql
```

**Save these IDs** (you'll get them from the SQL output):
```
product_id:    ________________________________
variant_s_id:  ________________________________
variant_m_id:  ________________________________
variant_l_id:  ________________________________
session_id:    ________________________________
user_id:       ________________________________
```

---

## 🧪 Testing Flow

---

## STEP 1: Verify Test Data Setup

### Database Check (Optional)

Run this SQL to verify inventory:

```sql
SELECT
    pv.variant_name,
    wi.quantity,
    wi.reserved_quantity,
    wi.max_stock_level,
    (wi.quantity - wi.reserved_quantity) as available
FROM warehouse_inventory wi
JOIN product_variants pv ON wi.variant_id = pv.id
WHERE wi.product_id = '{product_id}'
ORDER BY pv.variant_name;
```

**Expected Output:**
```
variant_name | quantity | reserved | max_stock | available
-------------|----------|----------|-----------|----------
Small        |    8     |    0     |     8     |    8
Medium       |    0     |    0     |     8     |    0
Large        |    8     |    0     |     8     |    8
```

✅ **Checkpoint**: All 3 variants exist with correct inventory levels

---

## STEP 2: Check All Variants Overflow Status (Frontend Endpoint)

**Purpose**: Get lock status for ALL variants at once (used by frontend to gray out locked options)

### 2.1 Open Swagger UI
Navigate to: **http://localhost:3003/api-docs**

### 2.2 Find Endpoint
Look for: **GET /api/warehouse/check-all-variants**

### 2.3 Execute Request

Click "Try it out"

**Parameters:**
```
productId: {your_product_id}
```

Click "Execute"

### 2.4 Expected Response

```json
{
  "success": true,
  "data": {
    "productId": "...",
    "variants": [
      {
        "variantId": "...",
        "variantName": "Small",
        "isLocked": false,
        "canOrder": true,
        "reason": "Stock available (8 units)",
        "availableQuantity": 8
      },
      {
        "variantId": "...",
        "variantName": "Medium",
        "isLocked": true,
        "canOrder": false,
        "reason": "Would overflow: Small, Large",
        "availableQuantity": 0,
        "overflowVariants": ["Small", "Large"]
      },
      {
        "variantId": "...",
        "variantName": "Large",
        "isLocked": false,
        "canOrder": true,
        "reason": "Stock available (8 units)",
        "availableQuantity": 8
      }
    ]
  }
}
```

✅ **Checkpoint**:
- Small: `isLocked: false` (has stock)
- Medium: `isLocked: true` (would overflow S and L)
- Large: `isLocked: false` (has stock)

**Frontend Integration Note:**
This response tells the UI to:
- Display Small and Large as white/enabled buttons
- Display Medium as gray/disabled with tooltip: "Would overflow: Small, Large"

---

## STEP 3: Check Individual Variant - Small (Should be UNLOCKED)

**Purpose**: Backend validation when user tries to join session

### 3.1 Find Endpoint
**GET /api/warehouse/check-bundle-overflow**

### 3.2 Execute Request

**Parameters:**
```
productId: {your_product_id}
variantId: {your_variant_s_id}
```

### 3.3 Expected Response

```json
{
  "success": true,
  "data": {
    "isLocked": false,
    "reason": "Stock available - no bundle order needed",
    "canOrder": true,
    "availableQuantity": 8
  }
}
```

✅ **Checkpoint**: Small is UNLOCKED because it has 8 units in stock

---

## STEP 4: Check Individual Variant - Medium (Should be LOCKED)

### 4.1 Same Endpoint
**GET /api/warehouse/check-bundle-overflow**

### 4.2 Execute Request

**Parameters:**
```
productId: {your_product_id}
variantId: {your_variant_m_id}
```

### 4.3 Expected Response

```json
{
  "success": true,
  "data": {
    "isLocked": true,
    "reason": "Ordering a bundle would exceed max stock for: Small, Large",
    "canOrder": false,
    "overflowVariants": ["Small (8+4=12>8)", "Large (8+4=12>8)"]
  }
}
```

✅ **Checkpoint**: Medium is LOCKED

**Why?**
- Current: S=8, M=0, L=8
- User wants 1 Medium → Warehouse needs to order a bundle
- After bundle: S=8+4=12, M=0+4=4, L=8+4=12
- S would be 12 > 8 (max) ❌
- L would be 12 > 8 (max) ❌
- **Result: Medium is LOCKED** 🔒

---

## STEP 5: Check Individual Variant - Large (Should be UNLOCKED)

### 5.1 Same Endpoint
**GET /api/warehouse/check-bundle-overflow**

### 5.2 Execute Request

**Parameters:**
```
productId: {your_product_id}
variantId: {your_variant_l_id}
```

### 5.3 Expected Response

```json
{
  "success": true,
  "data": {
    "isLocked": false,
    "reason": "Stock available - no bundle order needed",
    "canOrder": true,
    "availableQuantity": 8
  }
}
```

✅ **Checkpoint**: Large is UNLOCKED because it has 8 units in stock

---

## STEP 6: Verify Group Buying Session Exists

### 6.1 Open Group Buying Service Swagger
Navigate to: **http://localhost:3002/api-docs**

### 6.2 Find Endpoint
**GET /api/group-buying/session/{sessionId}**

### 6.3 Execute Request

**Parameters:**
```
sessionId: {your_session_id}
```

### 6.4 Expected Response

```json
{
  "success": true,
  "data": {
    "id": "...",
    "product_id": "...",
    "session_code": "TEST-...",
    "status": "forming",
    "target_moq": 12,
    "group_price": 8000,
    "base_price": 10000,
    "current_tier": 25,
    "bulk_shipping_cost_per_unit": 500,
    ...
  }
}
```

✅ **Checkpoint**: Session exists and status is "forming"

---

## STEP 7: Try to Join Session with Small (Should SUCCEED)

### 7.1 Find Endpoint
**POST /api/group-buying/join**

### 7.2 Execute Request

Click "Try it out"

**Request Body:**
```json
{
  "sessionId": "{your_session_id}",
  "userId": "{your_user_id}",
  "variantId": "{your_variant_s_id}",
  "quantity": 1,
  "unitPrice": 8000,
  "shippingAddress": "Jl. Test No. 123, Jakarta",
  "selectedShipping": {
    "courier": "jne",
    "service": "REG",
    "price": 10000,
    "etd": "2-3 days"
  }
}
```

### 7.3 Expected Response

```json
{
  "success": true,
  "message": "Successfully joined group buying session",
  "data": {
    "participantId": "...",
    "sessionId": "...",
    "variantId": "...",
    "quantity": 1,
    "totalAmount": ...,
    ...
  }
}
```

✅ **Checkpoint**: Join SUCCEEDED for Small variant (it's unlocked)

---

## STEP 8: Try to Join Session with Medium (Should FAIL - LOCKED)

### 8.1 Same Endpoint
**POST /api/group-buying/join**

### 8.2 Execute Request

**Request Body:**
```json
{
  "sessionId": "{your_session_id}",
  "userId": "{your_user_id}",
  "variantId": "{your_variant_m_id}",
  "quantity": 1,
  "unitPrice": 8000,
  "shippingAddress": "Jl. Test No. 123, Jakarta",
  "selectedShipping": {
    "courier": "jne",
    "service": "REG",
    "price": 10000,
    "etd": "2-3 days"
  }
}
```

### 8.3 Expected Response

```json
{
  "success": false,
  "error": "This variant is currently locked. Ordering a bundle would exceed max stock for: Small, Large. Other variants need to be ordered first to make room for a new bundle."
}
```

✅ **Checkpoint**: Join FAILED for Medium variant (it's locked) with clear error message

**User Experience:**
- Frontend would have already grayed out this button (from Step 2)
- But backend still validates to prevent direct API calls
- Error message explains WHY it's locked

---

## STEP 9: Try to Join Session with Large (Should SUCCEED)

### 9.1 Same Endpoint
**POST /api/group-buying/join**

### 9.2 Execute Request

**Request Body:**
```json
{
  "sessionId": "{your_session_id}",
  "userId": "{your_user_id}",
  "variantId": "{your_variant_l_id}",
  "quantity": 1,
  "unitPrice": 8000,
  "shippingAddress": "Jl. Test No. 123, Jakarta",
  "selectedShipping": {
    "courier": "jne",
    "service": "REG",
    "price": 10000,
    "etd": "2-3 days"
  }
}
```

### 9.3 Expected Response

```json
{
  "success": true,
  "message": "Successfully joined group buying session",
  "data": {
    "participantId": "...",
    "sessionId": "...",
    "variantId": "...",
    "quantity": 1,
    "totalAmount": ...,
    ...
  }
}
```

✅ **Checkpoint**: Join SUCCEEDED for Large variant (it's unlocked)

---

## STEP 10: Simulate Stock Change (Make Medium Unlocked)

### 10.1 Reduce Inventory in Database

Run this SQL:

```sql
-- Reduce Small and Large to 4 units each
UPDATE warehouse_inventory
SET quantity = 4
WHERE product_id = '{product_id}'
AND variant_id IN ('{variant_s_id}', '{variant_l_id}');
```

**New State:**
- S=4, M=0, L=4 (max=8 for all)
- After bundle: S=4+4=8, M=0+4=4, L=4+4=8
- No overflow! ✓

### 10.2 Recheck Medium Variant

Go back to Swagger: **GET /api/warehouse/check-bundle-overflow**

**Parameters:**
```
productId: {your_product_id}
variantId: {your_variant_m_id}
```

### 10.3 Expected Response

```json
{
  "success": true,
  "data": {
    "isLocked": false,
    "reason": "Bundle can be ordered without overflow",
    "canOrder": true
  }
}
```

✅ **Checkpoint**: Medium is now UNLOCKED! 🎉

### 10.4 Try Joining with Medium Again

**POST /api/group-buying/join** with Medium variant

**Expected**: Should now SUCCEED ✅

---

## STEP 11: Recheck All Variants

### 11.1 Execute
**GET /api/warehouse/check-all-variants**

**Parameters:**
```
productId: {your_product_id}
```

### 11.2 Expected Response

```json
{
  "success": true,
  "data": {
    "productId": "...",
    "variants": [
      {
        "variantName": "Small",
        "isLocked": false,
        "canOrder": true,
        "reason": "Stock available (4 units)",
        "availableQuantity": 4
      },
      {
        "variantName": "Medium",
        "isLocked": false,
        "canOrder": true,
        "reason": "Can order (bundle has room)",
        "availableQuantity": 0
      },
      {
        "variantName": "Large",
        "isLocked": false,
        "canOrder": true,
        "reason": "Stock available (4 units)",
        "availableQuantity": 4
      }
    ]
  }
}
```

✅ **Checkpoint**: ALL variants are now unlocked!

---

## 📊 Testing Summary Checklist

### Initial State (S=8, M=0, L=8)

- [ ] **Step 2**: Check all variants → S unlocked, M locked, L unlocked
- [ ] **Step 3**: Check Small → unlocked (has stock)
- [ ] **Step 4**: Check Medium → locked (bundle would overflow)
- [ ] **Step 5**: Check Large → unlocked (has stock)
- [ ] **Step 6**: Session exists and is "forming"
- [ ] **Step 7**: Join with Small → SUCCESS ✅
- [ ] **Step 8**: Join with Medium → FAIL ❌ (locked)
- [ ] **Step 9**: Join with Large → SUCCESS ✅

### After Stock Reduction (S=4, M=0, L=4)

- [ ] **Step 10**: Reduce inventory
- [ ] **Step 10.2**: Check Medium → now unlocked ✅
- [ ] **Step 10.4**: Join with Medium → SUCCESS ✅
- [ ] **Step 11**: All variants unlocked

---

## 🎯 What This Validates

### 1. **Frontend Endpoint** (`/check-all-variants`)
✅ Returns lock status for all variants in one call
✅ Frontend can gray out locked variants before user clicks
✅ Provides clear reason for each variant's status

### 2. **Backend Validation** (`/check-bundle-overflow`)
✅ Individual variant validation works correctly
✅ Correctly identifies when bundle would overflow
✅ Allows variants with current stock
✅ Blocks variants when bundle would exceed max_stock_level

### 3. **Join Session Integration**
✅ Calls overflow check before allowing join
✅ Succeeds for unlocked variants
✅ Fails with clear error for locked variants
✅ Error message explains why variant is locked

### 4. **Dynamic Updates**
✅ Lock status updates when inventory changes
✅ Locked variants can become unlocked when stock decreases
✅ Logic recalculates correctly for each request

---

## 🧹 Cleanup

After testing, delete test data:

```sql
DELETE FROM group_participants WHERE group_session_id = '{session_id}';
DELETE FROM group_buying_sessions WHERE id = '{session_id}';
DELETE FROM warehouse_inventory WHERE product_id = '{product_id}';
DELETE FROM grosir_bundle_composition WHERE product_id = '{product_id}';
DELETE FROM product_variants WHERE product_id = '{product_id}';
DELETE FROM products WHERE id = '{product_id}';
```

---

## 🐛 Troubleshooting

### Swagger UI Not Loading
```bash
# Check if service is running
curl http://localhost:3003/health
curl http://localhost:3002/health
```

### 401/403 Errors in Swagger
- Some endpoints might require authentication
- Check if there's an "Authorize" button in Swagger UI
- You may need to add authentication headers

### Data Not Found
- Make sure you ran the SQL setup script
- Verify IDs are correct (no typos)
- Check database connection

### Variant Shows Wrong Lock Status
- Verify inventory levels in database
- Check bundle composition is correct (4+4+4)
- Ensure max_stock_level is set to 8

---

## 📚 Additional Notes

### Understanding the Algorithm

**When is a variant LOCKED?**

A variant is locked when:
1. It has NO stock available (quantity - reserved = 0)
2. AND ordering a bundle would cause ANY other variant to exceed max_stock_level

**Example:**
```
Current: S=8, M=0, L=8 (max=8)
Bundle: 4S + 4M + 4L

User wants Medium:
→ Check: Does Medium have stock? NO (0 units)
→ Simulate bundle order: S=8+4=12, M=0+4=4, L=8+4=12
→ Check overflow: S: 12>8 ❌, L: 12>8 ❌
→ Result: Medium is LOCKED
```

### Frontend Implementation Guide

```javascript
// 1. On product page load, fetch all variant statuses
const response = await fetch(`/api/warehouse/check-all-variants?productId=${productId}`);
const { data } = await response.json();

// 2. Render variant buttons based on lock status
data.variants.forEach(variant => {
  if (variant.isLocked) {
    // Gray out button, add disabled class
    // Show tooltip with variant.reason
    button.disabled = true;
    button.tooltip = variant.reason;
  } else {
    // Normal white button
    button.disabled = false;
  }
});

// 3. When user clicks (if unlocked), proceed to join session
// Backend will validate again during join
```

---

**End of Testing Plan**

This testing plan validates the complete group buying overflow logic through Swagger UI. Follow each step carefully and check off items as you complete them. All tests should pass for the implementation to be correct! ✅
