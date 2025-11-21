# Admin Endpoints Reference

Complete documentation for all administrative endpoints across the Laku Platform services.

**Last Updated:** November 21, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Product Service](#product-service)
4. [Factory Service](#factory-service)
5. [Group Buying Service](#group-buying-service)
6. [Warehouse Service](#warehouse-service)
7. [Order Service](#order-service)
8. [Payment Service](#payment-service)
9. [Wallet Service](#wallet-service)
10. [Address Service](#address-service)
11. [Auth Service](#auth-service)
12. [Logistics Service](#logistics-service)
13. [Notification Service](#notification-service)
14. [WhatsApp Service](#whatsapp-service)

---

## Overview

The platform includes admin endpoints for 12 services with comprehensive management capabilities including CRUD operations, analytics, bulk operations, and system monitoring.

### Implementation Status

| Service | Status | Endpoints |
|---------|--------|-----------|
| Product Service | Complete | 15+ |
| Factory Service | Complete | 11 |
| Group Buying Service | Complete | 12 |
| Warehouse Service | Complete | 10 |
| Order Service | Complete | 10 |
| Payment Service | Complete | 8 |
| Wallet Service | Complete | 9 |
| Address Service | Complete | 6 |
| Auth Service | Complete | 9 |
| Logistics Service | Complete | 7 |
| Notification Service | Complete | 6 |
| WhatsApp Service | Complete | 3 |

---

## Authentication

All admin endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

---

## Product Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products with filters |
| GET | `/products/:id` | Get product details |
| POST | `/products` | Create new product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| POST | `/products/:id/variants` | Add product variant |
| PUT | `/products/:id/variants/:variantId` | Update variant |
| DELETE | `/products/:id/variants/:variantId` | Delete variant |
| POST | `/products/:id/images` | Add product images |
| DELETE | `/products/:id/images/:imageId` | Delete image |
| PUT | `/products/bulk-status` | Bulk update product status |
| DELETE | `/products/bulk-delete` | Bulk delete products |
| GET | `/categories` | Get all categories |
| POST | `/categories` | Create category |
| GET | `/analytics` | Get product analytics |

### Query Parameters

**GET /products**
- `page` (int): Page number
- `limit` (int): Items per page
- `status` (string): Filter by status
- `categoryId` (uuid): Filter by category
- `factoryId` (uuid): Filter by factory
- `search` (string): Search term

### Example Request

```bash
curl -X POST http://localhost:3003/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "factoryId": "uuid",
    "categoryId": "uuid",
    "name": "Product Name",
    "description": "Description",
    "basePrice": 100000
  }'
```

---

## Factory Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/factories` | Get all factories |
| GET | `/factories/:id` | Get factory details |
| PUT | `/factories/:id` | Update factory |
| PUT | `/factories/:id/status` | Update factory status |
| POST | `/factories/:id/verify` | Verify factory |
| POST | `/factories/:id/suspend` | Suspend factory |
| GET | `/factories/pending` | Get pending verifications |
| GET | `/analytics` | Get factory analytics |
| GET | `/factories/:id/sessions` | Get factory sessions |
| GET | `/factories/:id/performance` | Get performance metrics |
| DELETE | `/factories/:id` | Delete factory |

### Example Request

```bash
curl -X POST http://localhost:3004/api/admin/factories/{id}/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "notes": "Verification approved"
  }'
```

---

## Group Buying Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sessions` | Get all sessions |
| GET | `/sessions/:id` | Get session details |
| PUT | `/sessions/:id` | Update session |
| PUT | `/sessions/:id/status` | Update session status |
| POST | `/sessions/:id/extend` | Extend session duration |
| POST | `/sessions/:id/cancel` | Cancel session |
| GET | `/bundle-config` | Get bundle configurations |
| PUT | `/bundle-config/:id` | Update bundle config |
| GET | `/warehouse-tolerance` | Get warehouse tolerances |
| PUT | `/warehouse-tolerance/:id` | Update tolerance |
| GET | `/variant-allocations` | Get variant allocations |
| GET | `/analytics` | Get group buying analytics |

### Example Request

```bash
curl -X PUT http://localhost:3008/api/admin/sessions/{id}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "completed"
  }'
```

---

## Warehouse Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | Get all inventory |
| GET | `/inventory/:id` | Get inventory details |
| POST | `/inventory/:id/adjust` | Adjust stock |
| GET | `/purchase-orders` | Get purchase orders |
| GET | `/purchase-orders/:id` | Get PO details |
| PUT | `/purchase-orders/:id/status` | Update PO status |
| POST | `/purchase-orders/:id/receive` | Receive PO items |
| GET | `/low-stock` | Get low stock items |
| GET | `/analytics` | Get warehouse analytics |
| GET | `/audit-log` | Get audit log |

### Example Request

```bash
curl -X POST http://localhost:3011/api/admin/inventory/{id}/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "adjustment": 100,
    "reason": "Stock correction",
    "type": "add"
  }'
```

---

## Order Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get all orders |
| GET | `/orders/:id` | Get order details |
| PUT | `/orders/:id/status` | Update order status |
| POST | `/orders/:id/cancel` | Cancel order |
| POST | `/orders/bulk-status` | Bulk update status |
| POST | `/orders/bulk-cancel` | Bulk cancel orders |
| GET | `/analytics` | Get order analytics |
| GET | `/orders/:id/timeline` | Get order timeline |
| POST | `/orders/:id/notes` | Add order notes |
| GET | `/daily-summary` | Get daily summary |

### Query Parameters

**GET /orders**
- `page`, `limit`: Pagination
- `status`: Filter by status
- `userId`: Filter by user
- `startDate`, `endDate`: Date range

### Example Request

```bash
curl -X PUT http://localhost:3005/api/admin/orders/{id}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "shipped",
    "notes": "Shipped via JNE"
  }'
```

---

## Payment Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | Get all payments |
| GET | `/payments/:id` | Get payment details |
| GET | `/refunds` | Get all refunds |
| POST | `/refunds/:id/process` | Process refund (approve/reject) |
| GET | `/escrow` | Get escrow payments |
| POST | `/escrow/:id/release` | Release escrow |
| GET | `/analytics` | Get payment analytics |
| GET | `/ledger` | Get transaction ledger |

### Example Request

```bash
curl -X POST http://localhost:3006/api/admin/refunds/{id}/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "action": "approve",
    "notes": "Refund approved"
  }'
```

---

## Wallet Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallets` | Get all wallets |
| GET | `/wallets/:id` | Get wallet details |
| POST | `/wallets/:id/adjust` | Adjust wallet balance |
| PUT | `/wallets/:id/status` | Freeze/unfreeze wallet |
| GET | `/transactions` | Get all transactions |
| GET | `/withdrawals/pending` | Get pending withdrawals |
| POST | `/withdrawals/:id/process` | Process withdrawal |
| GET | `/analytics` | Get wallet analytics |

### Example Request

```bash
curl -X POST http://localhost:3010/api/admin/wallets/{id}/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 50000,
    "type": "credit",
    "reason": "Promotional credit"
  }'
```

---

## Address Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/addresses` | Get all addresses |
| GET | `/addresses/:id` | Get address details |
| PUT | `/addresses/:id` | Update address |
| DELETE | `/addresses/:id` | Delete address |
| POST | `/addresses/bulk-delete` | Bulk delete addresses |
| GET | `/analytics` | Get address analytics |

### Query Parameters

**GET /addresses**
- `userId`: Filter by user
- `district`: Filter by district
- `isDefault`: Filter default addresses

---

## Auth Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user details |
| PUT | `/users/:id` | Update user |
| PUT | `/users/:id/status` | Toggle user active status |
| PUT | `/users/:id/role` | Update user role |
| DELETE | `/users/:id` | Delete user |
| GET | `/otps` | Get OTP records |
| POST | `/otps/clear-expired` | Clear expired OTPs |
| GET | `/analytics` | Get user analytics |

### Query Parameters

**GET /users**
- `role`: Filter by role
- `isActive`: Filter by active status
- `search`: Search by name/phone/email

### Example Request

```bash
curl -X PUT http://localhost:3001/api/admin/users/{id}/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "role": "seller"
  }'
```

---

## Logistics Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shipments` | Get all shipments |
| GET | `/shipments/:id` | Get shipment details |
| PUT | `/shipments/:id/status` | Update shipment status |
| POST | `/shipments/:id/cancel` | Cancel shipment |
| POST | `/shipments/bulk-update` | Bulk update status |
| GET | `/analytics` | Get shipment analytics |
| GET | `/couriers/performance` | Get courier performance |

### Query Parameters

**GET /shipments**
- `status`: Filter by status
- `courierService`: Filter by courier
- `startDate`, `endDate`: Date range

---

## Notification Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get all notifications |
| POST | `/notifications/broadcast` | Send broadcast notification |
| DELETE | `/notifications/:id` | Delete notification |
| POST | `/notifications/bulk-delete` | Bulk delete notifications |
| POST | `/notifications/clear-old` | Clear old read notifications |
| GET | `/analytics` | Get notification analytics |

### Example Request

```bash
curl -X POST http://localhost:3007/api/admin/notifications/broadcast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "System Maintenance",
    "message": "Platform will be under maintenance tonight",
    "type": "broadcast",
    "channel": "push"
  }'
```

---

## WhatsApp Service

**Base URL:** `/api/admin`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/status` | Get WhatsApp connection status |
| POST | `/restart` | Restart WhatsApp connection |
| GET | `/health` | Health check |

### Example Request

```bash
curl http://localhost:3012/api/admin/status \
  -H "Authorization: Bearer $TOKEN"
```

---

## Common Response Formats

### Success Response

```json
{
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "error": "Error message",
  "errors": [
    { "field": "name", "message": "Name is required" }
  ]
}
```

---

## Service Ports

| Service | Port |
|---------|------|
| Auth Service | 3001 |
| Logistics Service | 3002 |
| Product Service | 3003 |
| Factory Service | 3004 |
| Order Service | 3005 |
| Payment Service | 3006 |
| Notification Service | 3007 |
| Group Buying Service | 3008 |
| Address Service | 3009 |
| Wallet Service | 3010 |
| Warehouse Service | 3011 |
| WhatsApp Service | 3012 |

---

## Testing

All endpoints can be tested via Swagger UI at each service's `/api-docs` endpoint (where available) or using curl/Postman.

For comprehensive E2E testing, refer to `SWAGGER_E2E_TESTING_GUIDE.md`.
