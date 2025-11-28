# Testing the Group Buying Overflow Logic

This directory contains everything you need to test the complete group buying overflow logic implementation.

## 🎯 What This Tests

The **Bundle Overflow Logic** prevents users from ordering variants when doing so would cause the warehouse to exceed its maximum stock capacity.

**Example Scenario:**
- Bundle: 4S + 4M + 4L (12 units total)
- Max Stock: 8S, 8M, 8L
- Current: 8S, 0M, 8L
- User wants to buy Medium → Warehouse would order a bundle → S and L would overflow (8+4=12 > 8)
- **Result**: Medium is LOCKED 🔒

## 📁 Test Files

1. **`setup-test-data.sql`** - SQL script to create test data in database
2. **`test-overflow-api.sh`** - Automated API testing script
3. **`TEST_OVERFLOW_LOGIC.md`** - Detailed manual testing guide
4. **`test-overflow-logic.ts`** - Full integration test (requires services running)

## 🚀 Quick Start

### Step 1: Start Services

```bash
# Start all services (from project root)
pnpm dev
```

Wait for services to start:
- Warehouse Service: http://localhost:3003
- Group Buying Service: http://localhost:3002
- Database: PostgreSQL

### Step 2: Set Up Test Data

```bash
# Run SQL script to create test product, variants, and inventory
psql $DATABASE_URL -f setup-test-data.sql
```

**Save the IDs printed at the end!** You'll need them for testing.

Example output:
```
product_id:    123e4567-e89b-12d3-a456-426614174000
variant_s_id:  123e4567-e89b-12d3-a456-426614174001
variant_m_id:  123e4567-e89b-12d3-a456-426614174002
variant_l_id:  123e4567-e89b-12d3-a456-426614174003
session_id:    123e4567-e89b-12d3-a456-426614174004
user_id:       123e4567-e89b-12d3-a456-426614174005
```

### Step 3: Run Automated Tests

```bash
# Replace with your actual IDs from Step 2
./test-overflow-api.sh \
  <product_id> \
  <variant_s_id> \
  <variant_m_id> \
  <variant_l_id>
```

Example:
```bash
./test-overflow-api.sh \
  123e4567-e89b-12d3-a456-426614174000 \
  123e4567-e89b-12d3-a456-426614174001 \
  123e4567-e89b-12d3-a456-426614174002 \
  123e4567-e89b-12d3-a456-426614174003
```

### Expected Results

```
✓ Small is UNLOCKED (has stock: 8 units)
✓ Medium is LOCKED (bundle would overflow S and L)
✓ Large is UNLOCKED (has stock: 8 units)

ALL TESTS PASSED! (3/3)
```

## 🧪 What Gets Tested

### 1. Frontend Endpoint (`/api/warehouse/check-all-variants`)

Returns lock status for ALL variants at once so frontend can:
- Display white/enabled buttons for unlocked variants
- Display gray/disabled buttons for locked variants with tooltip

### 2. Backend Validation (`/api/warehouse/check-bundle-overflow`)

Validates individual variant before allowing user to join session:
- Checks if variant has stock → unlocked
- Checks if ordering bundle would overflow other variants → locked

### 3. Join Session Logic

Group buying service calls overflow check before allowing user to join:
- ✅ Succeeds for unlocked variants (S, L)
- ❌ Fails for locked variants (M) with clear error message

## 📊 Test Scenarios

### Scenario 1: Initial State (M is Locked)
```
Inventory: S=8, M=0, L=8 (max=8)
Bundle: 4S + 4M + 4L

Small:  ✅ UNLOCKED (has stock)
Medium: 🔒 LOCKED (bundle would overflow S,L)
Large:  ✅ UNLOCKED (has stock)
```

### Scenario 2: After Stock Reduction (M is Unlocked)
```sql
-- Reduce stock to make room for bundle
UPDATE warehouse_inventory
SET quantity = 4
WHERE variant_id IN (variant_s_id, variant_l_id);
```

```
Inventory: S=4, M=0, L=4 (max=8)
Bundle: 4S + 4M + 4L
After bundle: S=8, M=4, L=8 ✓ No overflow!

Small:  ✅ UNLOCKED
Medium: ✅ UNLOCKED (bundle fits now!)
Large:  ✅ UNLOCKED
```

## 🔍 Manual Testing

For detailed step-by-step manual testing, see **`TEST_OVERFLOW_LOGIC.md`**.

Includes:
- Individual curl commands for each endpoint
- Expected responses for each test
- How to simulate stock changes
- Join session testing with actual API calls

## 🧹 Cleanup

```bash
# Delete test data (replace {ids} with actual values)
psql $DATABASE_URL -c "
  DELETE FROM group_participants WHERE group_session_id = '{session_id}';
  DELETE FROM group_buying_sessions WHERE id = '{session_id}';
  DELETE FROM warehouse_inventory WHERE product_id = '{product_id}';
  DELETE FROM grosir_bundle_composition WHERE product_id = '{product_id}';
  DELETE FROM product_variants WHERE product_id = '{product_id}';
  DELETE FROM products WHERE id = '{product_id}';
"
```

## 📝 Implementation Files

The overflow logic is implemented in:

- **Service**: `services/warehouse-service/src/services/warehouse.service.ts`
  - `checkBundleOverflow()` - Individual variant check
  - `checkAllVariantsOverflow()` - Bulk check for frontend

- **Controller**: `services/warehouse-service/src/controllers/warehouse.controller.ts`
  - HTTP endpoint handlers

- **Routes**: `services/warehouse-service/src/routes/warehouse.routes.ts`
  - API endpoint definitions with Swagger docs

- **Integration**: `services/group-buying-service/src/services/group.buying.service.ts`
  - Calls overflow check before allowing user to join

- **Documentation**: `COMPREHENSIVE_FLOW_SUMMARY.md`
  - Complete algorithm explanation and flow diagrams

## ✅ Success Criteria

- [ ] All services start successfully
- [ ] Test data creates without errors
- [ ] Check-all-variants returns correct status for all variants
- [ ] Small and Large are unlocked (have stock)
- [ ] Medium is locked (bundle would overflow)
- [ ] Automated test script shows "ALL TESTS PASSED"
- [ ] Error messages are clear and actionable

## 🐛 Troubleshooting

**Services won't start:**
```bash
# Check if ports are in use
lsof -i :3002
lsof -i :3003

# Kill processes if needed
kill -9 <PID>
```

**Database connection error:**
```bash
# Check DATABASE_URL environment variable
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Test script fails:**
```bash
# Make sure jq is installed (for JSON parsing)
sudo apt-get install jq

# Check if services are accessible
curl http://localhost:3003/api/warehouse/check-all-variants?productId=test
```

## 📚 Additional Resources

- Full implementation details: `COMPREHENSIVE_FLOW_SUMMARY.md`
- API documentation: Run services and visit Swagger UI
- Source code: `services/warehouse-service/` and `services/group-buying-service/`
