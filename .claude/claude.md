# E-Commerce Platform with Group Buying (Grosir) System

This is a microservices-based e-commerce platform built with Node.js/TypeScript, PostgreSQL, and Prisma ORM. The platform includes a sophisticated group buying (grosir/wholesale) system with warehouse inventory management.

## Project Structure

This is a monorepo managed with pnpm workspaces and Turborepo:

```
ecommerce-stable/
├── packages/
│   └── database/           # Shared Prisma schema and database client
│       └── prisma/
│           └── schema.prisma
├── services/
│   ├── product-service/    # Product catalog and variants
│   ├── warehouse-service/  # Inventory and purchase orders
│   ├── group-buying-service/ # Group buying sessions
│   ├── order-service/      # Order management
│   ├── payment-service/    # Payment processing
│   ├── auth-service/       # Authentication
│   ├── logistics-service/  # Shipping calculations
│   ├── factory-service/    # Factory/supplier management
│   └── ... (other services)
└── COMPREHENSIVE_FLOW_SUMMARY.md  # Detailed system documentation
```

## Core Concepts

### Group Buying (Grosir) System

The platform enables group buying where multiple customers can join together to purchase products at wholesale prices. The system uses a **simplified warehouse inventory model**:

1. **Bundle Composition** (`grosir_bundle_composition` table):
   - Defines how many units of each variant go into a wholesale bundle
   - Example: A t-shirt bundle might have 4 Small + 4 Medium + 4 Large = 12 units

2. **Warehouse Inventory** (`warehouse_inventory` table):
   - Tracks actual stock per product/variant
   - Fields: `quantity`, `reserved_quantity`, `max_stock_level`, `reorder_threshold`
   - Simple stock checking without complex tolerance/allocation calculations

3. **Purchase Orders** (`warehouse_purchase_orders` table):
   - Created when warehouse stock is insufficient
   - Orders bundles from factories in multiples defined by bundle composition

### Simplified Schema (Current Implementation)

**Tables Used:**
- ✅ `grosir_bundle_composition` - Units per bundle for each variant
- ✅ `warehouse_inventory` - Stock tracking with max levels and reorder points
- ✅ `warehouse_purchase_orders` - Factory orders for bundles

**Deprecated Tables (DO NOT USE):**
- ❌ `grosir_bundle_config` - Replaced by grosir_bundle_composition
- ❌ `grosir_warehouse_tolerance` - Replaced by warehouse_inventory config
- ❌ `grosir_variant_allocations` - No longer needed

## Key Services

### Product Service (Port 3001)
Manages product catalog, variants, and grosir configuration.

**Key Endpoints:**
- `POST /api/products/:id/bundle-composition` - Set units per bundle for variants
- `POST /api/products/:id/warehouse-inventory-config` - Set max stock and reorder thresholds
- `GET /api/products/:id/grosir-config` - Get all grosir configuration

**Repository Pattern:**
- `product.repository.ts` - Database operations
- `product.service.ts` - Business logic
- `product.controller.ts` - HTTP request handlers

### Warehouse Service (Port 3011)
Handles inventory management and purchase orders.

**Key Endpoints:**
- `POST /api/fulfill-bundle-demand` - Check inventory and create PO if needed
- `GET /api/inventory/status` - Get inventory status for product/variant
- Admin endpoints under `/api/admin`:
  - `GET /api/admin/inventory` - List all inventory
  - `POST /api/admin/inventory/:id/adjust` - Adjust stock levels
  - `POST /api/admin/inventory/:id/reserve` - Reserve stock
  - `POST /api/admin/inventory/:id/release` - Release reservation
  - `GET /api/admin/purchase-orders` - List purchase orders
  - `GET /api/admin/audit` - Stock audit report
  - `GET /api/admin/low-stock` - Low stock items

**Architecture:**
- `warehouse.repository.ts` - Database operations (ONLY for warehouse tables)
- `warehouse.service.ts` - Business logic + external service calls
- `warehouse.controller.ts` - HTTP handlers
- `admin.controller.ts` - Admin functionality

### Group Buying Service (Port 3005)
Orchestrates group buying sessions and participant management.

**Key Methods:**
- `createSession()` - Creates a new group buying session
- `joinSession()` - Adds participant to session (checks inventory via warehouse service)
- `completeSession()` - Finalizes session and triggers fulfillment
- `getVariantAvailability()` - Calls warehouse service for inventory status

**Cross-Service Communication:**
- ✅ Calls warehouse-service via HTTP for inventory checks
- ❌ Does NOT query warehouse tables directly (follows microservice boundaries)

## Development Guidelines

### Microservice Architecture Rules

1. **Database Access:**
   - Services should ONLY access their own tables directly
   - Use HTTP APIs to access other services' data
   - Repository layer isolates database operations

2. **Service Communication:**
   - Inter-service calls happen in `service.ts` files
   - Use axios for HTTP calls between services
   - Controllers handle HTTP requests/responses

3. **Code Organization:**
   ```
   service/
   ├── src/
   │   ├── controllers/     # HTTP request handlers
   │   ├── services/        # Business logic + external calls
   │   ├── repositories/    # Database operations only
   │   ├── routes/          # Route definitions + Swagger docs
   │   └── types/           # TypeScript interfaces
   ```

### Working with Grosir System

**Setting Up a Product for Group Buying:**

1. Create product and variants (product-service)
2. Set bundle composition:
   ```json
   POST /api/products/:id/bundle-composition
   {
     "compositions": [
       { "variantId": "uuid-s", "unitsInBundle": 4 },
       { "variantId": "uuid-m", "unitsInBundle": 4 },
       { "variantId": "uuid-l", "unitsInBundle": 4 }
     ]
   }
   ```
3. Configure warehouse inventory:
   ```json
   POST /api/products/:id/warehouse-inventory-config
   {
     "configs": [
       { "variantId": "uuid-s", "maxStockLevel": 100, "reorderThreshold": 20 },
       { "variantId": "uuid-m", "maxStockLevel": 120, "reorderThreshold": 30 },
       { "variantId": "uuid-l", "maxStockLevel": 80, "reorderThreshold": 15 }
     ]
   }
   ```

**Flow When Customer Joins Session:**

1. Group-buying-service receives join request
2. Calls `GET /api/inventory/status?productId=X&variantId=Y` (warehouse-service)
3. Checks if `availableQuantity >= requested quantity`
4. If yes: adds participant to session
5. When session completes: calls `POST /api/fulfill-bundle-demand` to reserve stock or create PO

## Important Files

- **COMPREHENSIVE_FLOW_SUMMARY.md** - Complete system flow documentation
- **packages/database/prisma/schema.prisma** - Database schema
- **packages/database/prisma/migrations/** - Database migrations

## Common Tasks

### Running Services Locally
```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run specific service
cd services/warehouse-service
pnpm dev

# Run all services
pnpm dev
```

### Database Operations
```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Create migration
cd packages/database
pnpm prisma migrate dev --name migration_name

# Open Prisma Studio
pnpm db:studio
```

### TypeScript Compilation
```bash
# Build specific service
cd services/warehouse-service
pnpm build

# Build all services
pnpm build
```

## Current Branch: simplified-inventory-work

This branch contains the simplified warehouse inventory model implementation. All services have been updated to use:
- New bundle composition API
- Simplified warehouse inventory tracking
- Removed old tolerance/allocation system

## Testing Guide

Refer to `E2E_TESTING_GUIDE.md` for end-to-end testing procedures, including grosir configuration steps.

## Need More Details?

For comprehensive system documentation including:
- Complete API flows
- Database schema details
- Service responsibilities
- Error handling patterns

See: **COMPREHENSIVE_FLOW_SUMMARY.md**
