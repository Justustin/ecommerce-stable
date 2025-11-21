# Group Buying Service Documentation

## Overview

The Group Buying Service manages group purchasing sessions where users can join together to reach minimum order quantities (MOQ) and unlock tiered pricing discounts.

---

## API Helper Methods

These private methods encapsulate external service calls for easy migration to Kafka later.

### Payment Service

| Method | Description |
|--------|-------------|
| `createEscrowPayment(data)` | Creates an escrow payment for a participant joining a session |
| `releaseEscrow(groupSessionId)` | Releases escrowed funds when production completes |
| `refundSession(groupSessionId, reason)` | Refunds all participants when session fails |
| `createBotPayment(data)` | Creates payment record for bot participant (accounting purposes) |

### Order Service

| Method | Description |
|--------|-------------|
| `createBulkOrders(groupSessionId, participants)` | Creates orders for all paid participants when session succeeds |

### Wallet Service

| Method | Description |
|--------|-------------|
| `creditWallet(data)` | Credits tier refunds to user wallets |

### Warehouse Service

| Method | Description |
|--------|-------------|
| `fulfillBundleDemand(data)` | Requests warehouse to fulfill demand, notifies factory if out of stock |

### Product Service

| Method | Description |
|--------|-------------|
| `fetchProduct(productId)` | Fetches product details for session creation |

### Notification Service

| Method | Description |
|--------|-------------|
| `sendNotification(data)` | Sends notification to a single user |
| `sendBulkNotification(data)` | Sends notification to multiple users |

---

## Public Service Methods

### Session Management

#### `createSession(data: CreateGroupSessionDTO)`
Creates a new group buying session with tiered pricing.

**Parameters:**
- `productId`: Product being sold
- `factoryId`: Factory producing the product
- `sessionCode`: Unique session identifier
- `targetMoq`: Minimum order quantity target
- `groupPrice`: Base price per unit
- `startTime`: Session start time
- `endTime`: Session expiration time
- `priceTier25/50/75/100`: Prices at each MOQ percentage tier

**Validations:**
- MOQ must be >= 2
- Group price must be > 0
- End time must be in future
- Tier prices must be in descending order (25% >= 50% >= 75% >= 100%)

**Returns:** Created session object

---

#### `getSessionById(id: string)`
Retrieves a session by its ID.

**Throws:** Error if session not found

---

#### `getSessionByCode(code: string)`
Retrieves a session by its session code.

**Throws:** Error if session not found

---

#### `listSessions(filters: GroupSessionFilters)`
Lists sessions with optional filtering.

**Parameters:**
- Pagination, status filters, date ranges

---

#### `updateSession(id: string, data: UpdateGroupSessionDTO)`
Updates session details.

**Restrictions:**
- Only sessions in 'forming' status can be updated

---

#### `deleteSession(id: string)`
Deletes a session.

**Restrictions:**
- Cannot delete confirmed/completed sessions
- Cannot delete sessions with participants

---

### Participant Management

#### `joinSession(data: JoinGroupDTO)`
Allows a user to join a group buying session.

**Flow:**
1. Validates session status and expiration
2. Validates quantity and pricing
3. Checks variant availability (grosir allocation)
4. Creates participant record
5. Creates escrow payment via payment-service
6. Checks if MOQ reached

**Returns:** Participant, payment, paymentUrl, invoiceId

**Error Handling:**
- Rolls back participant if payment creation fails

---

#### `leaveSession(sessionId: string, userId: string)`
Removes a user from a session.

**Restrictions:**
- Cannot leave confirmed (moq_reached/success) sessions

---

#### `getParticipants(sessionId: string)`
Gets all participants in a session.

---

#### `getSessionStats(sessionId: string)`
Gets session statistics including progress, time remaining, and MOQ status.

**Returns:**
- `participantCount`
- `totalRevenue`
- `targetMoq`
- `progress` (percentage)
- `moqReached` (boolean)
- `timeRemaining`
- `status`

---

### Variant Allocation (Grosir System)

#### `getVariantAvailability(sessionId: string, variantId: string | null)`
Checks availability for a specific variant with warehouse tolerance.

**Algorithm:**
- `maxAllowed = allocation + max_excess_units`
- `available = maxAllowed - currentOrdered`

**Returns:**
- `variantId`
- `allocation`
- `maxAllowed`
- `totalOrdered`
- `available`
- `isLocked`
- `tolerance` info

---

### Warehouse Integration

#### `fulfillWarehouseDemand(sessionId: string)`
Requests warehouse to fulfill session demand.

**Flow:**
1. Gets variant quantities from REAL participants only (excludes bot)
2. Calls warehouse service for each variant
3. Warehouse checks stock and sends WhatsApp to factory if needed
4. Updates session with warehouse check results

**Returns:**
- `hasStock`
- `grosirNeeded`
- `results` per variant

---

### Production Lifecycle

#### `startProduction(sessionId: string, factoryOwnerId: string)`
Factory owner starts production for a confirmed session.

**Requirements:**
- Session must be in 'moq_reached' status
- Only factory owner can start

---

#### `completeProduction(sessionId: string, factoryOwnerId: string)`
Marks production as complete and releases escrow.

**Flow:**
1. Validates ownership and status
2. Marks session as success
3. Releases escrowed payments

---

#### `cancelSession(sessionId: string, reason?: string)`
Cancels a session.

**Restrictions:**
- Cannot cancel confirmed or completed sessions

---

### MOQ and Expiration Processing

#### `checkMoqReached(sessionId: string)`
Checks if session has reached MOQ and marks it accordingly.

**Side Effects:**
- Updates session status to 'moq_reached' if target met

---

#### `processSessionsNearingExpiration()`
**Cron Job Method** - Processes sessions 8-10 minutes before expiration.

**Logic:**
- If < 25% filled: Creates bot participant to ensure minimum fill
- If >= 25%: No action needed

**Returns:** Array of results with actions taken

---

#### `processExpiredSessions()`
**Cron Job Method** - Main processor for expired sessions.

**Success Flow (MOQ reached):**
1. Claims session atomically (prevents duplicate processing)
2. Fulfills warehouse demand
3. Calculates final tier based on all participants (including bot)
4. Issues tier refunds to real participants
5. Removes bot participant
6. Creates bulk orders for paid participants
7. Creates next day session

**Failure Flow (MOQ not reached):**
1. Marks session as failed
2. Initiates refunds via payment-service
3. Creates next day session

**Returns:** Array of results (confirmed/pending_stock/failed)

---

### Utility Methods

#### `manuallyExpireAndProcess(sessionId: string)`
**Testing Only** - Forces a session to expire and processes it immediately.

---

### Private Helper Methods

#### `createNextDaySession(expiredSession)`
Creates a new identical session for the next day to ensure continuous product availability.

---

#### `calculateTimeRemaining(endTime: Date)`
Calculates hours and minutes until session expires.

---

#### `createBotParticipant(sessionId: string)`
Creates platform bot participant to fill to 25% MOQ.

**Note:** Bot doesn't pay real money - just ensures minimum tier is reached.

---

#### `updatePricingTier(sessionId: string)`
Updates session tier based on real participant fill percentage.

**Tier Thresholds:**
- >= 100%: Tier 100
- >= 75%: Tier 75
- >= 50%: Tier 50
- Default: Tier 25

---

#### `removeBotParticipant(botParticipantId: string)`
Removes bot after tier calculation (bot doesn't get real order).

---

## Status Flow

```
forming → active → moq_reached → success
                 ↓
              failed

pending_stock (waiting for factory to restock)
```

---

## Tiering System

1. Users pay **base price** when joining
2. At session end, final tier is calculated
3. If tier > 25%, refund `(basePrice - tierPrice) * quantity` to wallet
4. Bot ensures minimum 25% fill for platform commitment

**Example:**
- Base: Rp 100,000
- Tier 50: Rp 90,000
- User ordered 5 units
- Refund: (100,000 - 90,000) * 5 = Rp 50,000

---

## Integration Points

| Service | Purpose |
|---------|---------|
| payment-service | Escrow payments, releases, refunds |
| order-service | Bulk order creation |
| wallet-service | Tier refund credits |
| warehouse-service | Stock fulfillment, factory notifications |
| product-service | Product details |
| notification-service | User notifications |
| auth-service | User data (via other services) |

---

## Environment Variables

```env
PAYMENT_SERVICE_URL=http://localhost:3006
ORDER_SERVICE_URL=http://localhost:3005
WALLET_SERVICE_URL=http://localhost:3010
WAREHOUSE_SERVICE_URL=http://localhost:3011
PRODUCT_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3007
BOT_USER_ID=<platform-bot-user-uuid>
```
