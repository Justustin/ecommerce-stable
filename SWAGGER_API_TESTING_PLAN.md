# Group Buying Overflow Logic - Complete Swagger API Testing Plan

**Test the entire group buying flow from start to finish using ONLY Swagger APIs (no SQL required)**

---

## 🎯 Testing Objective

Create a complete test scenario through APIs to validate bundle overflow logic:
- Bundle: 4S + 4M + 4L (12 units)
- Max Stock: 8 units per variant
- Initial Inventory: S=8, M=0, L=8
- **Expected**: Small ✅ unlocked, Medium 🔒 locked, Large ✅ unlocked

---

## 📍 Service URLs & Swagger Access

Start services with `pnpm dev`, then access:

| Service | Port | Swagger UI |
|---------|------|------------|
| **Product Service** | 3001 | http://localhost:3001/api-docs |
| **Group Buying Service** | 3002 | http://localhost:3002/api-docs |
| **Warehouse Service** | 3003 | http://localhost:3003/api-docs |
| **Factory Service** | 3004 | http://localhost:3004/api-docs |

---

## 📝 Testing Flow (15 Steps)

### STEP 1: Create Category
**Service**: Product Service
**Endpoint**: `POST /api/admin/categories`

```json
{
  "name": "Test T-Shirts",
  "description": "Test category for overflow logic testing"
}
```

**Save from response**:
```
categoryId: _________________________________
```

✅ **Checkpoint**: Category created successfully

---

### STEP 2: Get Existing User ID (or Create One)

You'll need a user ID. Check your database for existing users:
```sql
SELECT id, email FROM users LIMIT 1;
```

Or if you have an auth service endpoint, create a test user.

**Save**:
```
userId: _________________________________
ownerId (factory owner): ____________________________
```

---

### STEP 3: Create Factory
**Service**: Factory Service
**Endpoint**: `POST /api/admin/factories`

```json
{
  "ownerId": "{userId}",
  "factoryCode": "TEST-FACTORY-001",
  "factoryName": "Test T-Shirt Factory",
  "phoneNumber": "+6281234567890",
  "email": "factory@test.com",
  "province": "DKI Jakarta",
  "city": "Jakarta Selatan",
  "district": "Kebayoran Baru",
  "postalCode": "12345",
  "addressLine": "Jl. Test No. 123",
  "description": "Factory for testing overflow logic"
}
```

**Save from response**:
```
factoryId: _________________________________
```

✅ **Checkpoint**: Factory created successfully

---

### STEP 4: Create Product
**Service**: Product Service
**Endpoint**: `POST /api/admin/products`

```json
{
  "factoryId": "{factoryId}",
  "categoryId": "{categoryId}",
  "sku": "TEST-TSHIRT-001",
  "name": "Test T-Shirt (Overflow Logic Test)",
  "description": "Product for testing bundle overflow logic",
  "basePrice": 10000,
  "costPrice": 5000,
  "moq": 12
}
```

**Save from response**:
```
productId: _________________________________
```

✅ **Checkpoint**: Product created successfully

---

### STEP 5: Create Variant - Small
**Service**: Product Service
**Endpoint**: `POST /api/admin/products/{productId}/variants`

Replace `{productId}` in URL with your productId

```json
{
  "sku": "TEST-TSHIRT-001-S",
  "variantName": "Small",
  "priceAdjustment": 0
}
```

**Save from response**:
```
variantSId: _________________________________
```

✅ **Checkpoint**: Small variant created

---

### STEP 6: Create Variant - Medium
**Service**: Product Service
**Endpoint**: `POST /api/admin/products/{productId}/variants`

```json
{
  "sku": "TEST-TSHIRT-001-M",
  "variantName": "Medium",
  "priceAdjustment": 0
}
```

**Save from response**:
```
variantMId: _________________________________
```

✅ **Checkpoint**: Medium variant created

---

### STEP 7: Create Variant - Large
**Service**: Product Service
**Endpoint**: `POST /api/admin/products/{productId}/variants`

```json
{
  "sku": "TEST-TSHIRT-001-L",
  "variantName": "Large",
  "priceAdjustment": 0
}
```

**Save from response**:
```
variantLId: _________________________________
```

✅ **Checkpoint**: Large variant created

---

### STEP 8: Set Bundle Composition (4S + 4M + 4L)
**Service**: Product Service
**Endpoint**: `POST /api/products/{productId}/bundle-composition`

```json
{
  "compositions": [
    {
      "variantId": "{variantSId}",
      "unitsInBundle": 4
    },
    {
      "variantId": "{variantMId}",
      "unitsInBundle": 4
    },
    {
      "variantId": "{variantLId}",
      "unitsInBundle": 4
    }
  ]
}
```

✅ **Checkpoint**: Bundle composition set (4+4+4=12 units per bundle)

---

### STEP 9: Set Warehouse Inventory Config (Max Stock = 8 each)
**Service**: Product Service
**Endpoint**: `POST /api/products/{productId}/warehouse-inventory-config`

```json
{
  "configs": [
    {
      "variantId": "{variantSId}",
      "maxStockLevel": 8,
      "reorderThreshold": 4
    },
    {
      "variantId": "{variantMId}",
      "maxStockLevel": 8,
      "reorderThreshold": 4
    },
    {
      "variantId": "{variantLId}",
      "maxStockLevel": 8,
      "reorderThreshold": 4
    }
  ]
}
```

✅ **Checkpoint**: Warehouse inventory config set (max=8, reorder=4 for all)

---

### STEP 10: Set Initial Inventory (S=8, M=0, L=8)

**Service**: Warehouse Service
**Endpoint**: `POST /api/admin/inventory/{inventoryId}/adjust`

**First, get inventory IDs:**
**Endpoint**: `GET /api/admin/inventory?productId={productId}`

From the response, note the `id` for each variant.

**Then adjust stock for Small (set to 8):**
```json
{
  "adjustment": 8,
  "reason": "Initial stock for testing",
  "adjustedBy": "{userId}"
}
```

**Adjust stock for Medium (set to 0):**
```json
{
  "adjustment": 0,
  "reason": "No stock for testing locked variant",
  "adjustedBy": "{userId}"
}
```

**Adjust stock for Large (set to 8):**
```json
{
  "adjustment": 8,
  "reason": "Initial stock for testing",
  "adjustedBy": "{userId}"
}
```

✅ **Checkpoint**: Inventory set to S=8, M=0, L=8

---

### STEP 11: Create Group Buying Session
**Service**: Group Buying Service
**Endpoint**: `POST /api/group-buying`

```json
{
  "productId": "{productId}",
  "factoryId": "{factoryId}",
  "sessionCode": "TEST-SESSION-001",
  "targetMoq": 12,
  "groupPrice": 8000,
  "priceTier25": 8000,
  "priceTier50": 7500,
  "priceTier75": 7000,
  "priceTier100": 6500,
  "endTime": "2025-12-31T23:59:59.000Z"
}
```

**Save from response**:
```
sessionId: _________________________________
```

✅ **Checkpoint**: Group buying session created

---

## 🧪 Testing Overflow Logic

---

### STEP 12: Check All Variants (Frontend Endpoint)

**Service**: Warehouse Service
**Endpoint**: `GET /api/warehouse/check-all-variants`

**Parameters**:
```
productId: {productId}
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

✅ **Checkpoint**:
- Small: `isLocked: false` ✅
- Medium: `isLocked: true` 🔒
- Large: `isLocked: false` ✅

**Why Medium is locked:**
- Current: S=8, M=0, L=8 (max=8)
- Ordering bundle would result in: S=12, M=4, L=12
- S and L would exceed max (12>8) ❌

---

### STEP 13: Test Individual Variant Checks

#### 13a. Check Small (Should be UNLOCKED)
**Endpoint**: `GET /api/warehouse/check-bundle-overflow`

**Parameters**:
```
productId: {productId}
variantId: {variantSId}
```

**Expected**:
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

✅ **Pass**: Small is unlocked

---

#### 13b. Check Medium (Should be LOCKED)
**Endpoint**: `GET /api/warehouse/check-bundle-overflow`

**Parameters**:
```
productId: {productId}
variantId: {variantMId}
```

**Expected**:
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

✅ **Pass**: Medium is locked

---

#### 13c. Check Large (Should be UNLOCKED)
**Endpoint**: `GET /api/warehouse/check-bundle-overflow`

**Parameters**:
```
productId: {productId}
variantId: {variantLId}
```

**Expected**:
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

✅ **Pass**: Large is unlocked

---

### STEP 14: Test Join Session

#### 14a. Join with Small (Should SUCCEED)
**Service**: Group Buying Service
**Endpoint**: `POST /api/group-buying/join`

```json
{
  "sessionId": "{sessionId}",
  "userId": "{userId}",
  "variantId": "{variantSId}",
  "quantity": 1,
  "unitPrice": 8000,
  "shippingAddress": "Jl. Test No. 456, Jakarta",
  "selectedShipping": {
    "courier": "jne",
    "service": "REG",
    "price": 10000,
    "etd": "2-3 days"
  }
}
```

**Expected**: ✅ Success - participant added

---

#### 14b. Join with Medium (Should FAIL - LOCKED)
**Service**: Group Buying Service
**Endpoint**: `POST /api/group-buying/join`

```json
{
  "sessionId": "{sessionId}",
  "userId": "{userId}",
  "variantId": "{variantMId}",
  "quantity": 1,
  "unitPrice": 8000,
  "shippingAddress": "Jl. Test No. 456, Jakarta",
  "selectedShipping": {
    "courier": "jne",
    "service": "REG",
    "price": 10000,
    "etd": "2-3 days"
  }
}
```

**Expected**: ❌ Error Response
```json
{
  "success": false,
  "error": "This variant is currently locked. Ordering a bundle would exceed max stock for: Small, Large. Other variants need to be ordered first to make room for a new bundle."
}
```

✅ **Pass**: Join failed with clear error message

---

#### 14c. Join with Large (Should SUCCEED)
**Service**: Group Buying Service
**Endpoint**: `POST /api/group-buying/join`

```json
{
  "sessionId": "{sessionId}",
  "userId": "{userId}",
  "variantId": "{variantLId}",
  "quantity": 1,
  "unitPrice": 8000,
  "shippingAddress": "Jl. Test No. 456, Jakarta",
  "selectedShipping": {
    "courier": "jne",
    "service": "REG",
    "price": 10000,
    "etd": "2-3 days"
  }
}
```

**Expected**: ✅ Success - participant added

---

### STEP 15: Test Dynamic Updates (Make Medium Unlocked)

#### 15a. Reduce Small Stock
**Service**: Warehouse Service
**Endpoint**: `POST /api/admin/inventory/{smallInventoryId}/adjust`

```json
{
  "adjustment": -4,
  "reason": "Reducing stock to test unlock logic",
  "adjustedBy": "{userId}"
}
```

New state: S=4

---

#### 15b. Reduce Large Stock
**Service**: Warehouse Service
**Endpoint**: `POST /api/admin/inventory/{largeInventoryId}/adjust`

```json
{
  "adjustment": -4,
  "reason": "Reducing stock to test unlock logic",
  "adjustedBy": "{userId}"
}
```

New state: L=4

**Inventory is now**: S=4, M=0, L=4
**After bundle**: S=4+4=8, M=0+4=4, L=4+4=8 (no overflow!)

---

#### 15c. Recheck Medium
**Endpoint**: `GET /api/warehouse/check-bundle-overflow`

**Parameters**:
```
productId: {productId}
variantId: {variantMId}
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

✅ **Pass**: Medium is now UNLOCKED! 🎉

---

#### 15d. Join with Medium (Should Now SUCCEED)
**Service**: Group Buying Service
**Endpoint**: `POST /api/group-buying/join`

```json
{
  "sessionId": "{sessionId}",
  "userId": "{userId}",
  "variantId": "{variantMId}",
  "quantity": 1,
  "unitPrice": 8000,
  "shippingAddress": "Jl. Test No. 456, Jakarta",
  "selectedShipping": {
    "courier": "jne",
    "service": "REG",
    "price": 10000,
    "etd": "2-3 days"
  }
}
```

**Expected**: ✅ Success - participant added

---

## 📊 Testing Checklist

### Initial State (S=8, M=0, L=8)
- [ ] Category created
- [ ] Factory created
- [ ] Product created
- [ ] 3 variants created (S, M, L)
- [ ] Bundle composition set (4+4+4)
- [ ] Warehouse config set (max=8)
- [ ] Initial inventory set (S=8, M=0, L=8)
- [ ] Group buying session created
- [ ] **Check all variants**: S unlocked, M locked, L unlocked
- [ ] **Check Small**: unlocked (has stock)
- [ ] **Check Medium**: locked (would overflow)
- [ ] **Check Large**: unlocked (has stock)
- [ ] **Join with Small**: SUCCESS ✅
- [ ] **Join with Medium**: FAIL ❌ (locked)
- [ ] **Join with Large**: SUCCESS ✅

### After Stock Reduction (S=4, M=0, L=4)
- [ ] Reduced Small to 4
- [ ] Reduced Large to 4
- [ ] **Recheck Medium**: now unlocked ✅
- [ ] **Join with Medium**: SUCCESS ✅

---

## 🎯 Success Criteria

All checks should pass:
1. ✅ All entities created via APIs (no SQL)
2. ✅ Small unlocked (has stock)
3. ✅ Medium locked (bundle would overflow)
4. ✅ Large unlocked (has stock)
5. ✅ Join succeeds for unlocked variants
6. ✅ Join fails for locked variant with clear error
7. ✅ Medium becomes unlocked after reducing stock
8. ✅ Error messages are clear and actionable

---

## 📝 Notes

### camelCase Format
All request bodies use camelCase as requested:
- `factoryId`, `categoryId`, `productId`
- `variantId`, `unitsInBundle`
- `maxStockLevel`, `reorderThreshold`
- `sessionCode`, `targetMoq`, `groupPrice`
- `priceTier25`, `priceTier50`, etc.

### Why This Tests Everything
1. **Complete API Flow**: Everything created through APIs (product → variants → bundle → inventory → session)
2. **Frontend Endpoint**: Bulk check for UI display
3. **Backend Validation**: Individual checks during join
4. **Dynamic Updates**: Lock status changes with inventory
5. **Clear Errors**: User-friendly error messages

---

## 🧹 Cleanup (Optional)

Delete test data through admin endpoints:
- `DELETE /api/admin/products/{productId}`
- `DELETE /api/admin/categories/{categoryId}`
- `DELETE /api/admin/factories/{factoryId}`

The session and participants will cascade delete automatically.
