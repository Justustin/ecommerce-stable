# Group Buying Overflow Logic - Testing Guide

This guide will walk you through testing the complete group buying overflow logic.

## Prerequisites

1. Start the database (PostgreSQL)
2. Start the warehouse-service (port 3003)
3. Start the group-buying-service (port 3002)

```bash
# From root directory
pnpm dev
```

## Test Scenario

**Bundle Configuration**: 4S + 4M + 4L = 12 units per bundle
**Max Stock Level**: 8 units per variant
**Current Inventory**: S=8, M=0, L=8

**Expected Behavior**:
- **Small (S)**: Has stock (8 units) → UNLOCKED ✅
- **Medium (M)**: No stock, but bundle would overflow S and L (8+4>8) → LOCKED 🔒
- **Large (L)**: Has stock (8 units) → UNLOCKED ✅

## Step 1: Set Up Test Data

Run the SQL script to create test product, variants, bundle composition, and inventory:

```bash
psql $DATABASE_URL -f setup-test-data.sql
```

This will output the IDs you'll need for testing (save these!):
- `product_id`
- `variant_s_id`, `variant_m_id`, `variant_l_id`
- `session_id`

## Step 2: Test Check All Variants Endpoint (Frontend UX)

This endpoint returns the lock status for ALL variants at once, so the frontend can gray out locked options.

```bash
# Replace {product_id} with the actual ID from Step 1
curl -X GET "http://localhost:3003/api/warehouse/check-all-variants?productId={product_id}" | jq
```

**Expected Response**:
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

✅ **Frontend Integration**: Use this response to:
- Display white/enabled buttons for Small and Large
- Display gray/disabled buttons for Medium with tooltip: "Would overflow: Small, Large"

## Step 3: Test Individual Variant Checks

Test the backend overflow check for each variant:

```bash
# Test Small (should be UNLOCKED)
curl -X GET "http://localhost:3003/api/warehouse/check-bundle-overflow?productId={product_id}&variantId={variant_s_id}" | jq

# Test Medium (should be LOCKED)
curl -X GET "http://localhost:3003/api/warehouse/check-bundle-overflow?productId={product_id}&variantId={variant_m_id}" | jq

# Test Large (should be UNLOCKED)
curl -X GET "http://localhost:3003/api/warehouse/check-bundle-overflow?productId={product_id}&variantId={variant_l_id}" | jq
```

**Expected for Small**:
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

**Expected for Medium (LOCKED)**:
```json
{
  "success": true,
  "data": {
    "isLocked": true,
    "reason": "Ordering a bundle would exceed max stock for: Small, Large",
    "canOrder": false,
    "overflowVariants": ["Small (...)", "Large (...)"]
  }
}
```

## Step 4: Test Join Session

Test joining the group buying session with different variants:

```bash
# Join with Small (should SUCCEED)
curl -X POST "http://localhost:3002/api/group-buying/join" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "{session_id}",
    "userId": "{user_id}",
    "variantId": "{variant_s_id}",
    "quantity": 1,
    "unitPrice": 8000,
    "shippingAddress": "Test Address",
    "selectedShipping": {
      "courier": "jne",
      "service": "REG",
      "price": 10000
    }
  }' | jq
```

**Expected**: ✅ Success - user joins session

```bash
# Join with Medium (should FAIL - LOCKED)
curl -X POST "http://localhost:3002/api/group-buying/join" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "{session_id}",
    "userId": "{user_id}",
    "variantId": "{variant_m_id}",
    "quantity": 1,
    "unitPrice": 8000,
    "shippingAddress": "Test Address",
    "selectedShipping": {
      "courier": "jne",
      "service": "REG",
      "price": 10000
    }
  }' | jq
```

**Expected**: ❌ Error response:
```json
{
  "success": false,
  "error": "This variant is currently locked. Ordering a bundle would exceed max stock for: Small, Large. Other variants need to be ordered first to make room for a new bundle."
}
```

## Step 5: Simulate Stock Change and Retest

Now let's change the inventory to make Medium unlocked:

```bash
# Reduce Small and Large inventory to make room for a bundle
psql $DATABASE_URL -c "
  UPDATE warehouse_inventory
  SET quantity = 4
  WHERE product_id = '{product_id}'
  AND variant_id IN ('{variant_s_id}', '{variant_l_id}')
"
```

New state: S=4, M=0, L=4
After bundle: S=4+4=8, M=0+4=4, L=4+4=8 (no overflow!)

```bash
# Check Medium again - should now be UNLOCKED
curl -X GET "http://localhost:3003/api/warehouse/check-bundle-overflow?productId={product_id}&variantId={variant_m_id}" | jq
```

**Expected**:
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

Now joining with Medium should succeed! ✅

## Verification Checklist

- [ ] Check-all-variants endpoint returns correct lock status for all variants
- [ ] Small variant is unlocked when it has stock
- [ ] Medium variant is locked when bundle would overflow other variants
- [ ] Large variant is unlocked when it has stock
- [ ] Join session succeeds for unlocked variants (S, L)
- [ ] Join session fails for locked variant (M) with clear error message
- [ ] After reducing stock, Medium becomes unlocked
- [ ] Lock status updates dynamically based on current inventory

## What This Tests

1. **Bundle Overflow Algorithm**: Correctly identifies when ordering a bundle would exceed max_stock_level
2. **Frontend UX Endpoint**: Bulk check endpoint provides all variant statuses at once
3. **Backend Validation**: Join session properly validates overflow before allowing user to join
4. **Dynamic Updates**: Lock status changes based on current inventory levels
5. **Error Messages**: Clear, actionable error messages explain why variants are locked

## Cleanup

```bash
# Delete test data
psql $DATABASE_URL -c "
  DELETE FROM group_participants WHERE group_session_id = '{session_id}';
  DELETE FROM group_buying_sessions WHERE id = '{session_id}';
  DELETE FROM warehouse_inventory WHERE product_id = '{product_id}';
  DELETE FROM grosir_bundle_composition WHERE product_id = '{product_id}';
  DELETE FROM product_variants WHERE product_id = '{product_id}';
  DELETE FROM products WHERE id = '{product_id}';
"
```
