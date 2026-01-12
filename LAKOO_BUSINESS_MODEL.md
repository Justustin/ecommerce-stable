# LAKOO E-COMMERCE PLATFORM - BUSINESS MODEL

**Last Updated:** January 2026  
**Status:** Active Development  
**Document Purpose:** New Employee Onboarding Guide

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Business Model Overview](#business-model-overview)
3. [Core Entities](#core-entities)
4. [Revenue Model](#revenue-model)
5. [The 15 LAKOO Brands](#the-15-lakoo-brands)
6. [How Orders Work](#how-orders-work)
7. [Warehouse & Inventory System](#warehouse--inventory-system)
8. [Third-Party Seller Marketplace](#third-party-seller-marketplace)
9. [Advertising System](#advertising-system)
10. [Platform Features](#platform-features)
11. [Marketing Strategy](#marketing-strategy)
12. [Technology Stack](#technology-stack)
13. [Team Structure](#team-structure)
14. [Success Metrics](#success-metrics)

---

## EXECUTIVE SUMMARY

**What is LAKOO?**

LAKOO is an Indonesian fashion e-commerce platform operating a **Shein-style multi-brand model** combined with an **advertising-based third-party marketplace**.

**Key Differentiators:**
- **15 Official Brands** - Multiple brand identities (like Shein has ROMWE, SHEIN X, etc.)
- **Centralized Warehouse** - All brands pull from one inventory pool
- **0% Commission Marketplace** - Third-party sellers list for free, pay only for advertising
- **Professional Presentation** - Standardized photography, packaging, and storefront design
- **Live Commerce** - Daily live streaming with influencers and celebrities

**Target Market:** Indonesian consumers aged 18-40, fashion-conscious, value-seeking

**Business Stage:** Development/Pre-Launch (transitioning from previous group buying model)

---

## BUSINESS MODEL OVERVIEW

### The Three-Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMERS                                 │
│                 (Browse & Buy)                               │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
┌───────▼──────────┐      ┌────────▼──────────┐
│  LAKOO BRANDS    │      │  THIRD-PARTY      │
│   (15 Brands)    │      │    SELLERS        │
│                  │      │                   │
│ • LAKOO Elite    │      │ • Pay 0% fees     │
│ • LAKOO Street   │      │ • Pay for ads     │
│ • LAKOO Classic  │      │ • Own inventory   │
│ • ... (12 more)  │      │                   │
└───────┬──────────┘      └───────────────────┘
        │
        │ (Pull from)
        │
┌───────▼──────────────────────────────────────┐
│         LAKOO WAREHOUSE                       │
│                                               │
│ • Owns all inventory for 15 brands           │
│ • Orders from factories in bulk              │
│ • Manages grosir bundle constraints          │
│ • Fulfills all brand orders                  │
└───────────────────────────────────────────────┘
```

### Why This Model Works

**For Customers:**
- Wide variety (15 different brand styles + third-party sellers)
- Professional quality control
- Fast shipping (centralized warehouse)
- Trusted platform

**For LAKOO:**
- Control over quality (official brands)
- High margins (50-60% on brands)
- Additional revenue from ads (third-party sellers)
- Brand equity (multiple brand identities)

**For Sellers:**
- No commission fees (vs. 10-15% on other platforms)
- Access to LAKOO's customer base
- Professional tools (page builder, photography studio)
- Optional advertising for growth

---

## CORE ENTITIES

### 1. LAKOO WAREHOUSE

**Function:** Inventory owner and fulfillment center

**Key Responsibilities:**
- Purchase inventory from factories in bulk (grosir bundles)
- Store all products for 15 official brands
- Quality control and inspection
- Order fulfillment and shipping
- Inventory forecasting and reordering

**Critical System: Grosir Bundle Allocation**
- Factories ship in fixed bundles (e.g., 2S + 5M + 4L + 1XL = 12 units)
- Warehouse tracks tolerance levels per size (max excess allowed)
- Real-time constraint checking prevents overstock of unpopular sizes
- Proactive ordering based on demand forecasting

**Location:** TBD (ideally 500-1000m² near Jakarta)

**Staff:**
- Warehouse Manager
- 5-10 Warehouse Workers
- 2-3 Quality Control Inspectors
- 1 Inventory Manager

---

### 2. LAKOO PLATFORM

**Function:** E-commerce platform operator and brand manager

**Key Responsibilities:**
- Operate website and mobile apps
- Manage 15 brand storefronts
- Process customer payments
- Handle customer service
- Marketing and advertising
- Technology development

**Revenue Sources:**
- **Brand Sales:** "Buy" from warehouse at transfer price, sell to customers at retail price (50-60% margin)
- **Advertising:** Third-party sellers pay for product promotion
- **Live Streaming:** Direct sales during live events

**Team:** See [Team Structure](#team-structure) section

---

### 3. THIRD-PARTY SELLERS

**Function:** Independent merchants selling on LAKOO marketplace

**Characteristics:**
- Own their inventory (not from LAKOO warehouse)
- Manage their own fulfillment
- Pay 0% commission on sales
- Pay for advertising if they want visibility

**Seller Tools Provided:**
- Seller dashboard (manage products, orders)
- Drag-and-drop page builder (create professional storefront)
- Analytics (sales, traffic, conversion)
- Access to photography studio (optional, paid)
- Advertising campaign manager

**Target Sellers:**
- Small/medium fashion brands
- Individual designers
- Boutique owners
- Resellers with unique products

---

## REVENUE MODEL

### Revenue Breakdown (Projected Monthly)

```
┌─────────────────────────────────────────────────────────────┐
│ REVENUE SOURCE           │ AMOUNT (Rp)     │ % OF TOTAL    │
├─────────────────────────────────────────────────────────────┤
│ 1. LAKOO Official Brands │ 4,500,000,000   │ 93%           │
│    (15 brands × Rp 300M) │                 │               │
│                          │                 │               │
│ 2. Third-Party Ads       │ 350,000,000     │ 7%            │
│    (70 advertisers       │                 │               │
│     × Rp 5M/month)       │                 │               │
│                          │                 │               │
│ TOTAL MONTHLY REVENUE    │ 4,850,000,000   │ 100%          │
└─────────────────────────────────────────────────────────────┘

ANNUAL REVENUE: Rp 58.2 Billion
```

### Cost Structure (Estimated Monthly)

```
┌─────────────────────────────────────────────────────────────┐
│ COST ITEM                │ AMOUNT (Rp)     │ % OF REVENUE  │
├─────────────────────────────────────────────────────────────┤
│ Cost of Goods (from      │ 1,800,000,000   │ 37%           │
│ factories)               │                 │               │
│                          │                 │               │
│ Salaries & Staff         │ 1,200,000,000   │ 25%           │
│                          │                 │               │
│ Marketing & Content      │ 500,000,000     │ 10%           │
│                          │                 │               │
│ Warehouse Operations     │ 200,000,000     │ 4%            │
│                          │                 │               │
│ Technology & Hosting     │ 100,000,000     │ 2%            │
│                          │                 │               │
│ TOTAL MONTHLY COSTS      │ 3,800,000,000   │ 78%           │
├─────────────────────────────────────────────────────────────┤
│ NET PROFIT               │ 1,050,000,000   │ 22%           │
└─────────────────────────────────────────────────────────────┘

ANNUAL PROFIT: Rp 12.6 Billion
```

---

## THE 15 LAKOO BRANDS

Each brand has its own identity, target audience, and aesthetic. Same products can appear in multiple brands with different pricing.

### Brand Portfolio

| # | Brand Name | Target Audience | Price Range | Style |
|---|------------|----------------|-------------|-------|
| 1 | **LAKOO Elite** | Young professionals, 25-35 | Rp 200K-500K | Professional, elegant, premium |
| 2 | **LAKOO Street** | Gen Z, streetwear fans, 18-25 | Rp 100K-300K | Urban, edgy, bold graphics |
| 3 | **LAKOO Classic** | All ages, timeless style | Rp 150K-350K | Minimalist, neutral colors |
| 4 | **LAKOO Active** | Fitness enthusiasts | Rp 100K-400K | Sportswear, athleisure |
| 5 | **LAKOO Kids** | Parents buying for children | Rp 80K-200K | Fun, durable, comfortable |
| 6 | **LAKOO Modest** | Modest fashion seekers | Rp 150K-400K | Hijabs, long dresses, modest |
| 7 | **LAKOO Curve** | Plus-size customers | Rp 150K-400K | Trendy, flattering cuts |
| 8 | **LAKOO Luxe** | High-income shoppers | Rp 400K-1M | Premium materials, designer-inspired |
| 9 | **LAKOO Casual** | Everyday comfort | Rp 80K-250K | Relaxed, comfortable, basics |
| 10 | **LAKOO Party** | Social events, nightlife | Rp 200K-600K | Bold, glamorous, statement |
| 11 | **LAKOO Bohemian** | Free-spirited, artistic | Rp 150K-400K | Flowy, patterns, earthy tones |
| 12 | **LAKOO Minimalist** | Clean aesthetic lovers | Rp 150K-350K | Simple, neutral, quality fabrics |
| 13 | **LAKOO Vintage** | Retro fashion enthusiasts | Rp 150K-400K | 70s/80s/90s inspired |
| 14 | **LAKOO Sustainable** | Eco-conscious shoppers | Rp 200K-500K | Eco-friendly materials |
| 15 | **LAKOO X** | Trend followers | Rp 100K-300K | Fast fashion, trend-driven |

### Brand Management

**Each Brand Has:**
- Dedicated Brand Account Manager
- Own Instagram/TikTok accounts
- Unique brand storefront page
- Distinct visual identity (colors, fonts, photography style)
- Curated product selection from warehouse
- Independent pricing strategy
- Own marketing campaigns

**How Products Are Assigned:**
1. Product arrives at warehouse (e.g., "White T-Shirt")
2. Brand managers review new products
3. Multiple brands can "claim" the same product
4. Each brand sets their own price (within guidelines)
5. Example:
   - LAKOO Classic sells it for Rp 120K
   - LAKOO Elite sells same shirt for Rp 180K (premium positioning)
   - LAKOO Casual sells it for Rp 99K (value positioning)

---

## HOW ORDERS WORK

### Customer Journey: LAKOO Brand Purchase

```
1. BROWSE
   Customer visits LAKOO Street brand page
   ↓
2. SELECT
   Chooses "Black Hoodie" - Size M
   ↓
3. ADD TO CART
   System checks grosir availability in real-time:
   ✓ M size available (not locked)
   ✓ Added to cart
   ↓
4. CHECKOUT
   Enters shipping address
   Selects payment method
   ↓
5. PAYMENT
   Pays Rp 250,000 via Xendit (e-wallet/bank transfer/credit card)
   Order status: "Pending Payment"
   ↓
6. PAYMENT CONFIRMED
   Xendit webhook confirms payment received
   Order status: "Processing"
   Inventory reserved in warehouse
   ↓
7. FULFILLMENT
   Warehouse picks, packs, and ships
   Order status: "Shipped"
   ↓
8. LOGISTICS
   Biteship generates tracking number
   Customer receives tracking link
   ↓
9. DELIVERY
   Product delivered (2-5 days)
   Order status: "Delivered"
   ↓
10. REVIEW
    Customer can leave review with photos
```

### Customer Journey: Third-Party Seller Purchase

```
1. BROWSE → 2. SELECT → 3. ADD TO CART → 4. CHECKOUT → 5. PAYMENT
   (Same as above)
   ↓
6. PAYMENT CONFIRMED
   Order sent to seller dashboard
   Seller has 24 hours to confirm
   ↓
7. SELLER FULFILLMENT
   Seller packs and ships from their location
   Uploads tracking number
   ↓
8. DELIVERY → 9. REVIEW
   (Same as above)
```

### Payment Flow

**LAKOO Brand Order:**
```
Customer pays: Rp 250,000
    ↓
Xendit receives payment
    ↓
Xendit fee (3%): Rp 7,500
    ↓
Platform receives: Rp 242,500
    ↓
Platform pays warehouse: Rp 100,000 (transfer price)
    ↓
Shipping cost: Rp 20,000 (subsidized by platform)
    ↓
Platform net: Rp 122,500 (49% margin)
```

**Third-Party Seller Order:**
```
Customer pays: Rp 250,000
    ↓
Xendit receives payment
    ↓
Xendit fee (3%): Rp 7,500
    ↓
Seller receives: Rp 242,500 (100% - gateway fee)
    ↓
Platform receives: Rp 0 (0% commission)
```

### Refund & Return Process

**Customer initiates return:**
1. Within 7 days of delivery
2. Submits return request with reason
3. CS agent reviews (or auto-approved for valid reasons)
4. Return label generated
5. Customer ships back
6. Warehouse inspects upon receipt
7. If approved: Full refund to original payment method
8. If rejected: Item returned to customer

**Refund Types:**
- Full refund (wrong item, defective, not as described)
- Partial refund (minor defect customer keeps)
- Store credit (customer choice)
- Exchange (different size/color)

---

## WAREHOUSE & INVENTORY SYSTEM

### The Grosir Bundle System

**Critical Concept:** Factories don't ship individual items. They ship fixed bundles.

**Example: T-Shirt Factory Bundle**
```
Factory ships 1 bundle = 12 units:
- 2 × Small
- 5 × Medium
- 4 × Large
- 1 × XL
```

**The Problem:**
If customers only want Medium, we'd need to order 5 bundles (60 units) to get 25 Mediums. But that means we also get:
- 10 Smalls (might not sell)
- 20 Larges (might not sell)
- 5 XLs (might not sell)

**The Solution: Tolerance System**

Warehouse sets maximum excess allowed per size:
```
Size    | Max Excess Allowed
--------|-------------------
Small   | 20 units
Medium  | 50 units
Large   | 40 units
XL      | 30 units
```

**Real-Time Constraint Checking:**

When customer tries to order:
1. System calculates total demand across ALL orders + carts (all 15 brands)
2. Calculates how many bundles needed to fulfill demand
3. Calculates resulting excess per size
4. If any size would exceed tolerance → LOCK that variant
5. Customer sees: "Size M temporarily unavailable - other sizes need to catch up!"

**Example Calculation:**
```
Current orders + carts across all brands:
- S: 15 units
- M: 48 units (HIGH DEMAND)
- L: 22 units
- XL: 8 units

To fulfill 48 Medium, need 10 bundles (48 ÷ 5 = 9.6 → round up)

10 bundles result in:
- S: 20 (need 15, excess: 5) ✓ OK
- M: 50 (need 48, excess: 2) ✓ OK
- L: 40 (need 22, excess: 18) ✓ OK
- XL: 10 (need 8, excess: 2) ✓ OK

All within tolerance → Customer can order any size

But if M reaches 51:
- Need 11 bundles (51 ÷ 5 = 10.2 → round up)
- M excess would be 55 - 51 = 4 ✓ Still OK
- BUT L excess would be 44 - 22 = 22 ✓ Still OK
- S excess would be 22 - 15 = 7 ✓ Still OK

Actually still OK! But if M reaches 60:
- Need 12 bundles
- L excess: 48 - 22 = 26 ✓ OK
- S excess: 24 - 15 = 9 ✓ OK
- XL excess: 12 - 8 = 4 ✓ OK

Still OK! System is smart.

But if SMALL only has 5 orders and M has 60:
- Need 12 bundles for M
- S excess: 24 - 5 = 19 ✓ OK (under 20 limit)
- Just barely OK

If one more S is removed (now 4 orders):
- S excess: 24 - 4 = 20 ✓ EXACTLY at limit

If S drops to 3:
- S excess: 24 - 3 = 21 ✗ EXCEEDS limit (max 20)
- System LOCKS Medium and Large sizes
- Message: "S and XL sizes need more orders before M/L available"
```

### Proactive Inventory Ordering

**Don't Wait for Orders:**
1. Analyze sales trends (last 30 days)
2. Forecast demand for next 2 weeks
3. Create Purchase Orders (POs) to factories
4. Maintain buffer stock (never run out)

**PO Creation:**
- Manual: Inventory Manager creates PO
- Automated: System suggests POs based on low stock alerts

**Factory Communication:**
- WhatsApp messages (automated via Baileys)
- Email POs
- Track delivery dates

---

## THIRD-PARTY SELLER MARKETPLACE

### Why Sellers Choose LAKOO

**Competitive Comparison:**

| Platform | Commission | Advertising |
|----------|-----------|-------------|
| Tokopedia | 5-10% | Pay extra for ads |
| Shopee | 5-15% | Pay extra for ads |
| Instagram | 0% | No built-in ads |
| **LAKOO** | **0%** | **Optional, pay only if want** |

### Seller Onboarding

**Step 1: Registration**
- Create account
- Shop name, logo, description
- Business details (optional: business license, tax ID)

**Step 2: Verification**
- Admin reviews application
- Checks shop legitimacy
- Approves/rejects (typically within 24 hours)

**Step 3: Setup**
- Add products (name, price, images, variants, inventory)
- Customize storefront using page builder
- Set shipping options
- Connect bank account for payouts

**Step 4: Go Live**
- Publish shop
- Start selling (no fees!)
- Optional: Create ad campaigns

### Seller Tools

**Dashboard:**
- Sales overview (today, week, month)
- Order management (pending, shipped, delivered)
- Product management (add, edit, delete)
- Inventory tracking
- Financial reports
- Customer messages

**Page Builder:**
- Drag-and-drop components (banners, product grids, text)
- Pre-built templates
- Mobile-responsive automatically
- No coding required

**Photography Studio (Optional):**
- Book time slots
- Professional equipment available
- Pay per product or per hour
- Editing services available

**Analytics:**
- Traffic sources
- Conversion rate
- Top products
- Customer demographics

### Seller Payouts

**Payout Schedule:** Weekly (every Monday)

**Payout Calculation:**
```
Week's sales: Rp 10,000,000
- Xendit fees (3%): Rp 300,000
- Ad spend: Rp 500,000 (if seller ran ads)
────────────────────────────────
Payout to seller: Rp 9,200,000
```

**Payout Methods:**
- Bank transfer (Indonesian banks)
- E-wallet (GoPay, OVO, DANA)

---

## ADVERTISING SYSTEM

### Core Principle

**Sellers pay ZERO commission but can pay for visibility.**

### Ad Types Available

#### 1. Sponsored Search (CPC/CPM)

**What it is:** Product appears in search results with "Sponsored" badge

**Pricing Models:**
- **CPC (Cost Per Click):** Rp 500-5,000 per click
- **CPM (Cost Per 1000 Impressions):** Rp 20,000 per 1000 views

**How it works:**
```
Customer searches "summer dress"
    ↓
Search results show:
    [Sponsored Product 1] 🔸
    [Sponsored Product 2] 🔸
    [Sponsored Product 3] 🔸
    ────────────────────
    [Regular Product 1]
    [Regular Product 2]
    ...
```

**Seller Setup:**
1. Select products to promote (up to 20)
2. Choose keywords ("summer dress", "casual dress")
3. Set bid amount (higher bid = higher position)
4. Set daily budget (e.g., Rp 500,000/day)
5. Campaign runs until budget depleted or end date

#### 2. Homepage Banner Ads

**What it is:** Large banner on LAKOO homepage

**Pricing:**
- Hero Banner (top, full-width): Rp 10M/day
- Side Banner: Rp 3M/day
- Bottom Banner: Rp 2M/day
- Minimum booking: 3 days

**Best for:** Big promotions, brand launches

#### 3. Category Featured

**What it is:** Shop appears in "Featured Sellers" section at top of category

**Pricing:** Rp 500K/week per slot

**Example:**
```
Category: Women's Dresses

Featured Sellers (Sponsored):
┌─────────────┬─────────────┬─────────────┐
│ Seller A    │ Seller B    │ Seller C    │
│ [Shop Now]  │ [Shop Now]  │ [Shop Now]  │
└─────────────┴─────────────┴─────────────┘

All Products:
[Regular product grid...]
```

#### 4. Email Newsletter

**What it is:** Feature in LAKOO's weekly email to 100K+ subscribers

**Pricing:**
- Product spotlight (3 products): Rp 5M/campaign
- Banner in email: Rp 2M/campaign

### Advertising Dashboard

**Seller View:**
```
Campaign Performance

Active Campaigns: 2

┌─────────────────────────────────────────────┐
│ Campaign: "Summer Sale"                     │
│ Type: Sponsored Search (CPC)                │
│ Status: 🟢 Active                           │
│                                             │
│ Today's Performance:                        │
│ • Impressions: 12,456                       │
│ • Clicks: 342 (CTR: 2.74%)                  │
│ • Orders: 23 (Conversion: 6.7%)             │
│ • Spend: Rp 171,000                         │
│ • Revenue: Rp 2,300,000                     │
│ • ROI: 13.5x                                │
│                                             │
│ Budget: Rp 500,000/day                      │
│ Remaining: Rp 329,000                       │
│                                             │
│ [Pause] [Edit] [View Report]                │
└─────────────────────────────────────────────┘
```

**Admin View:**
- Review pending campaigns (manual approval)
- Monitor platform ad revenue
- Adjust pricing
- Manage banner slot inventory
- Fraud detection

### Ad Revenue Potential

**Assumptions:**
- 300 total sellers on platform
- 25% advertise regularly (75 sellers)
- Average spend: Rp 5M/month per seller

**Monthly Ad Revenue:**
```
75 sellers × Rp 5,000,000 = Rp 375,000,000/month
Annual: Rp 4.5 Billion
```

---

## PLATFORM FEATURES

### For Customers

#### 1. Product Discovery

**Homepage:**
- Hero banners (promotions, featured brands)
- Shop by brand (15 brand cards)
- Trending products
- New arrivals
- Flash sales
- Live shopping (ongoing streams)

**Search:**
- Intelligent search (handles typos, synonyms)
- Autocomplete suggestions
- Filters (price, size, color, brand, rating)
- Sort (relevance, price, newest)

**Categories:**
- Hierarchical navigation (Women → Dresses → Casual Dresses)
- Breadcrumbs for easy backtracking

**Brand Storefronts:**
- Each brand has dedicated page
- Brand story and values
- Curated collections
- Follow brand for updates

#### 2. Product Pages

**Professional Presentation:**
- 10 high-quality photos per product
- Zoom functionality (2x-4x)
- 360° view (if available)
- Video demonstrations
- Product badges ("100% Cotton", "Anti-Crease")

**Variant Selection:**
- Visual size chart
- Color swatches
- Stock availability per variant
- Real-time grosir constraint status

**Product Information:**
- Detailed description
- Material composition
- Care instructions
- Size guide (with model measurements)
- Estimated delivery date

**Social Proof:**
- Customer reviews (star rating, text, photos)
- "True to size" feedback
- Helpful votes on reviews
- Q&A section

#### 3. Shopping Experience

**Cart:**
- Save for later
- Apply voucher codes
- Use wallet balance
- See total with shipping

**Checkout:**
- Multi-step process (clear, not overwhelming)
- Address selection/creation
- Shipping method (economy, regular, express)
- Payment method (bank transfer, e-wallet, credit card, installments)
- Order review before confirming

**Payment Methods:**
- Bank Transfer (all Indonesian banks)
- E-wallets (GoPay, OVO, DANA, ShopeePay)
- Credit/Debit Cards (Visa, Mastercard)
- Installment plans (Kredivo, Akulaku)
- LAKOO Wallet (stored balance)

#### 4. Order Tracking

**Order Status Flow:**
```
To Pay → Processing → Shipped → Delivered → Completed
```

**Order Detail Page:**
- Real-time status updates
- Estimated delivery date
- Tracking number (link to courier)
- Live tracking map
- Order timeline (visual)
- Contact seller button
- Download invoice
- Request return/refund

#### 5. Account Management

**Profile:**
- Edit personal info
- Profile picture
- Preferred categories
- Style preferences

**Addresses:**
- Multiple addresses
- Set default
- Label (Home, Office, etc.)

**Payment Methods:**
- Saved cards
- E-wallet linking

**Order History:**
- Filter (status, date range)
- Reorder functionality
- Track all orders

**Wishlist:**
- Save products for later
- Price drop alerts
- Back-in-stock notifications

**LAKOO Wallet:**
- Check balance
- Top-up
- Withdrawal to bank
- Transaction history
- Wallet can be loaded with refunds, cashback, promotional credits

**Reviews:**
- My reviews
- Edit reviews
- Upload photos to existing reviews

#### 6. Personalization

**Onboarding Quiz (New Users):**
```
Question 1: What's your style?
[Minimalist] [Bohemian] [Streetwear] [Classic] [Edgy]

Question 2: Favorite brands?
[Zara] [H&M] [Uniqlo] [Gap] [Other]

Question 3: Your size?
Top: [S] [M] [L] [XL]

Question 4: Budget per item?
[<100K] [100-300K] [300-500K] [500K+]

Question 5 (Optional): Upload style photos
```

**Result:**
- Personalized homepage feed
- Product recommendations
- Brand recommendations

**Ongoing Learning:**
- Tracks browsing behavior
- Learns from purchases
- Refines recommendations over time

#### 7. Live Shopping

**Live Stream Room:**
- HD video stream
- Product overlay (click to buy)
- Live chat (comment, react)
- Flash sales during stream
- Giveaways and games

**Featured Streams:**
- Daily streams (schedule on homepage)
- Celebrity/influencer hosts
- Brand launches
- Behind-the-scenes factory tours
- Styling sessions

**Viewer Experience:**
- One-tap purchase without leaving stream
- Share stream to social media
- Set reminder for upcoming streams
- Watch replays

#### 8. Customer Service

**Support Channels:**
- Live chat (AI first, human escalation)
- WhatsApp
- Email
- Phone (for urgent issues)
- In-app ticket system

**Self-Service:**
- FAQ/Knowledge base
- Order tracking
- Automated refund requests
- Return label generation

**Response Times:**
- Live chat: <5 minutes (during business hours)
- WhatsApp/Email: <2 hours
- Phone: Immediate
- Tickets: <24 hours

---

### For Sellers (Third-Party)

#### 1. Seller Dashboard

**Overview:**
- Today's sales
- Pending orders (need action)
- Messages from customers
- Low stock alerts
- Performance score (rating, response time)

**Products:**
- Add new product (name, price, images, variants, inventory)
- Bulk upload (CSV)
- Edit existing products
- Mark out of stock
- Duplicate products

**Orders:**
- Filter (pending, packed, shipped, completed)
- Print packing slips
- Print shipping labels (Biteship integration)
- Mark as shipped (upload tracking)
- Bulk processing

**Inventory:**
- Stock levels per variant
- Low stock alerts
- Stock movement history
- Inventory sync (if using external systems)

**Financials:**
- Sales reports (daily, weekly, monthly)
- Payout schedule
- Payout history
- Balance (pending vs. available)
- Ad spend tracking

**Messages:**
- Customer inbox
- Quick replies (canned responses)
- Auto-responders
- Mark as read/unread

**Shop Settings:**
- Shop name, logo, banner
- About/description
- Policies (shipping, returns)
- Business hours
- Vacation mode

#### 2. Page Builder

**Drag-and-Drop Interface:**
- Component library (banners, product grids, text, images)
- Pre-built templates (10+ full-page templates)
- Live preview
- Mobile/tablet/desktop view toggle
- Publish/unpublish pages

**Customization:**
- Upload images
- Edit text inline
- Select products from catalog
- Choose colors (from brand palette)
- Adjust spacing/layout

**Pages You Can Build:**
- Homepage (main shop page)
- Collections (seasonal, themed)
- About page
- Contact page

#### 3. Advertising

**Campaign Manager:**
- Create new campaign (wizard)
- Choose ad type (sponsored search, banner, category)
- Set budget and schedule
- View performance analytics
- Pause/resume campaigns

**Top-Up Balance:**
- Add funds to ad account
- Payment methods (same as customer checkout)
- Bonus for large top-ups (e.g., top-up Rp 10M, get 5% bonus)

**Reports:**
- Impressions, clicks, conversions
- ROI by campaign
- Best performing products
- Keyword performance (for search ads)
- Hour-of-day analysis

#### 4. Analytics

**Traffic:**
- Page views
- Unique visitors
- Referral sources (social media, Google, direct)
- Search terms used to find shop

**Sales:**
- Revenue trends
- Average order value
- Conversion rate
- Cart abandonment rate
- Repeat customer rate

**Products:**
- Best sellers
- Low performers
- View-to-purchase ratio

**Customers:**
- New vs. returning
- Customer demographics (age, location)
- Lifetime value

---

### For Brand Managers (Internal)

#### 1. Brand Dashboard

**Performance:**
- Sales (today, week, month, year)
- Revenue
- Orders
- Average order value
- Conversion rate
- Top products
- Customer demographics

**Product Curation:**
- Browse warehouse catalog
- Assign products to brand
- Set brand-specific pricing
- Set discount pricing
- Mark products as featured
- Create collections

**Storefront Editor:**
- Visual page builder (same as seller page builder)
- Brand-specific templates
- Maintain brand identity (colors, fonts)

**Content Management:**
- Upload brand story
- Add team photos
- Create blog posts
- Upload lookbooks

#### 2. Social Media Management

**Content Calendar:**
- Schedule Instagram posts
- Schedule TikTok videos
- Schedule Stories
- Plan campaigns

**Content Creation:**
- Access to photography studio
- Access to models
- Access to props
- Editing software

**Analytics:**
- Follower growth
- Engagement rate (likes, comments, shares)
- Link clicks to products
- Traffic driven to storefront
- Sales attributed to social media

**Campaigns:**
- Monthly campaign planning
- Influencer collaborations
- User-generated content campaigns
- Contests and giveaways

#### 3. Marketing Budget

**Monthly Budget:** Rp 20M per brand

**Allocation:**
- Paid ads (Instagram, TikTok, Google): Rp 10M
- Influencer partnerships: Rp 5M
- Props, styling, misc: Rp 3M
- Giveaways: Rp 2M

**Approval Process:**
- Campaigns >Rp 5M require CMO approval
- Monthly budget review
- ROI tracking

---

### For Admins (Internal)

#### 1. Super Admin Dashboard

**Platform Overview:**
- Total users (customers + sellers)
- Active orders (last 24 hours)
- Revenue (today, week, month)
- Top selling products
- System health (API response time, errors)

**Pending Actions:**
- Seller verifications (approve/reject)
- Product moderations (approve/reject)
- Ad campaign approvals
- Refund requests (review exceptions)
- Customer disputes

#### 2. User Management

**Customers:**
- View all users
- Search/filter (name, email, phone, registration date)
- View user details (orders, reviews, wallet)
- Suspend/ban accounts (spam, fraud)
- Reset passwords
- Adjust wallet balance (for CS resolutions)

**Sellers:**
- View all sellers
- Verification queue
- Performance monitoring (rating, response time, order fulfillment)
- Suspend/ban sellers (policy violations)
- Adjust commission (if special deals)

#### 3. Brand Management

**Configure 15 Brands:**
- Create/edit brands
- Set brand managers
- Monitor brand performance
- Rebalance inventory between brands

**Brand Settings:**
- Brand name, slug, logo
- Brand story
- Target audience
- Price multiplier (vs. warehouse cost)
- Color palette
- Font choices

#### 4. Product Moderation

**Approval Queue:**
- Review new products from sellers
- Check photos (quality, appropriateness)
- Check descriptions (accuracy, no prohibited items)
- Approve/reject with reason

**Bulk Actions:**
- Approve all from trusted sellers
- Reject all from new sellers (until established)

**Policy Enforcement:**
- Prohibited items (weapons, drugs, counterfeit)
- Copyright violations
- Inappropriate content

#### 5. Order Management

**Search Orders:**
- By order ID, customer, seller, product
- Filter by status, date range, amount

**Manual Interventions:**
- Cancel orders (with refund)
- Mark as shipped (if seller forgot)
- Extend delivery timeframe
- Issue refunds

**Dispute Resolution:**
- Customer vs. seller disputes
- Review evidence (photos, messages)
- Make final decision
- Issue refunds or deny

#### 6. Financial Controls

**Settlement Approval:**
- Review weekly payouts to sellers
- Approve/hold payouts (if fraud suspected)
- Adjust for refunds/returns

**Refund Management:**
- Manual refund issuance
- Bulk refunds (if platform error)

**Commission Settings:**
- Set default commission rates (currently 0%)
- Special deals for large sellers

**Reports:**
- Revenue by brand
- Revenue by seller
- Gateway fees
- Ad revenue
- Net profit

#### 7. Warehouse Control

**Inventory Overview:**
- Real-time stock levels (all products, all variants)
- Reserved inventory (pending orders)
- Available inventory
- Low stock alerts

**Purchase Orders:**
- View all POs (pending, shipped, received)
- Create manual POs
- Approve POs (if >Rp 50M)
- Track factory deliveries

**Grosir Monitoring:**
- Current tolerance status per variant
- Locked variants (excess too high)
- Bundle utilization efficiency
- Recommendations (which products to order)

**Warehouse Operations:**
- Receiving (log incoming shipments)
- Quality control (accept/reject)
- Stock adjustments (damage, loss, found)
- Cycle counting (regular inventory audits)

#### 8. Content Management

**Homepage:**
- Edit hero banners
- Feature brands
- Feature products
- Manage flash sales

**Static Pages:**
- Edit About Us
- Edit FAQ
- Edit Terms & Conditions
- Edit Privacy Policy

**Blog:**
- Create blog posts
- Fashion tips
- Style guides
- Behind-the-scenes

**Email Templates:**
- Order confirmation
- Shipping notification
- Delivery confirmation
- Promotional emails

#### 9. System Configuration

**General Settings:**
- Site name, logo, favicon
- Default currency (IDR)
- Default language (Indonesian)
- Time zone (Asia/Jakarta)

**Feature Toggles:**
- Enable/disable live streaming
- Enable/disable AI recommendations
- Enable/disable seller marketplace
- Enable/disable specific payment methods

**Shipping Settings:**
- Courier partners (Biteship)
- Free shipping threshold
- Shipping subsidies
- Same-day delivery zones

**Payment Settings:**
- Payment gateway (Xendit)
- Supported payment methods
- Installment plans
- Gateway fees

**Tax Settings:**
- VAT rate (11% in Indonesia)
- Tax ID
- Tax invoicing

#### 10. Security & Compliance

**Activity Logs:**
- Admin actions (who did what, when)
- Failed login attempts
- Suspicious activity

**Fraud Detection:**
- Duplicate accounts
- Suspicious orders (high value, multiple addresses)
- Bot activity
- Fake reviews

**GDPR/Privacy:**
- Data export (user requests their data)
- Data deletion (right to be forgotten)
- Privacy policy compliance

---

## MARKETING STRATEGY

### 1. Content Marketing

#### Professional Product Photography

**Standards:**
- 10 photos minimum per SKU
- 2000×2000px resolution
- Professional lighting
- Multiple angles (front, back, side, detail)
- Lifestyle shots (model wearing)
- Flat lay (packaging)

**Photo Types:**
1. Full front (mannequin/model)
2. Full back
3. Full side
4. Fabric texture (macro)
5. Detail shots (collar, buttons, stitching)
6. Size comparison
7. Lifestyle (styled look)
8. Packaging
9. Care label
10. Color variations (if applicable)

**Badges Overlay:**
- Material ("100% Cotton")
- Features ("Wrinkle-Free", "Breathable")
- Sustainability ("Eco-Friendly")
- Care ("Machine Washable")
- Origin ("Made in Indonesia")

**Photography Team:**
- 1 Lead Photographer per 3 brands
- 1 Assistant Photographer
- 2 Photo Editors
- 1 Stylist

**Output:** 400 photos edited per day

#### Packaging & Unboxing Experience

**Tiered Packaging:**

**LAKOO Elite (Premium):**
- Black/gold branded boxes
- Tissue paper wrapping
- Personalized thank you card
- Collectible sticker sheet
- Mini lookbook catalog
- Cost: Rp 15,000/package

**LAKOO Street (Edgy):**
- Custom-printed mailers
- Sticker pack (street art designs)
- Postcard (brand story)
- Cost: Rp 8,000/package

**LAKOO Classic (Minimalist):**
- Eco-friendly kraft boxes
- Simple branded seal
- Care instruction card
- Cost: Rp 5,000/package

**Universal Elements:**
- QR code (rate product, share on social, get discount)
- Return instructions
- Brand story insert
- Referral code (friend gets 10% off)

**Goal:** 5% of customers share unboxing on social media (free marketing)

#### Video Content

**Social Proof Marketing:**
Showcase real people from different backgrounds buying LAKOO

**Video Series:**
1. "The Student Collection" (university students, <Rp 300K outfits)
2. "The Professional Upgrade" (young professionals, Rp 500K-1M outfits)
3. "The Village Entrepreneur" (rural business owners, success stories)
4. "The Working Parent" (busy parents, Rp 400-800K)
5. "The Luxury Shopper" (high-income, LAKOO Elite)

**Format:** 60-90 second vertical videos (TikTok, Reels, Stories)

**Production:**
- 3-4 days per video (interview, shopping, styling, reveal)
- Participant keeps clothes + Rp 2M compensation
- Cost: Rp 7M per video

**Distribution:**
- Organic: All LAKOO social channels
- Paid: Rp 2M boost per video (target similar demographics)

**Expected Performance:**
- 500K-2M views per video
- 3-5% CTR
- 2-3% conversion
- ROI: 10-20x

#### Transformation/Gimmick Marketing

**Concept:** "Beauty Inside, Style Outside"

**Example Campaign:**
1. Find real people (street performers, vendors, etc.)
2. Professional makeover (makeup + hair)
3. Dress in LAKOO clothes
4. Professional photoshoot
5. Before/after reveal video
6. Share their story

**Video Structure (3-5 minutes):**
- Part 1: The story (who they are, struggles, dreams)
- Part 2: The makeover (time-lapse, building anticipation)
- Part 3: The reveal (emotional reaction, photoshoot)
- Part 4: The message ("Everyone deserves to feel confident")

**Cost:** Rp 20M per video

**Expected Reach:** 1.5-5M views per video (emotional content = shares)

**Frequency:** 1-2 videos per month

### 2. Live Commerce

**Daily Live Streams:**
- Prime time: 7-9 PM
- Rotating brands (each brand goes live 2x/week)
- Weekend specials (celebrity hosts)

**Stream Formats:**
1. Product launch (60 min)
2. Celebrity styling (90 min)
3. Behind-the-scenes factory tour (45 min)
4. Customer makeover (120 min)

**Host Roster:**
- Tier 1 (Celebrities): Once/month, Rp 50-200M per appearance
- Tier 2 (Macro Influencers): Weekly, Rp 10-30M
- Tier 3 (Micro Influencers): Daily, Rp 2-5M
- Tier 4 (Brand Ambassadors): Always available, salaried (Rp 15M/month)

**Production Setup:**
- Dedicated studio
- 2 cameras (main + close-up)
- Professional lighting
- Green screen (changeable backgrounds)
- Live chat monitor
- Streaming software (OBS/Streamlabs)

**Monetization:**
- Exclusive live-only discounts (20-40% off)
- Flash sales (100 units at massive discount)
- Bundle deals
- Free shipping for live viewers

**Expected Performance:**
- 10,000 viewers/stream average
- 5% purchase during/after = 500 orders
- Average order value: Rp 300K
- Revenue per stream: Rp 150M
- Monthly (30 streams): Rp 4.5B

**Monthly Costs:**
- Host fees: Rp 120M
- Production crew: Rp 240M
- Studio overhead: Rp 20M
- Total: Rp 380M

**ROI:** 4.5B revenue / 380M cost = 11.8x

### 3. Influencer & Celebrity Partnerships

**Influencer Tiers:**

**Mega (1M+ followers):**
- 1-2 partnerships per quarter
- Cost: Rp 50-100M per campaign
- Deliverables: 3 posts, 5 stories, 1 video

**Macro (100K-1M followers):**
- 5-10 partnerships per month
- Cost: Rp 5-20M per campaign
- Deliverables: 2 posts, 3 stories

**Micro (10K-100K followers):**
- 20-30 partnerships per month
- Cost: Rp 500K-2M per campaign
- Deliverables: 1 post, 2 stories

**Nano (<10K followers but high engagement):**
- Gifting program (free products in exchange for posts)
- 50-100 per month

**Affiliate Program:**
- Influencers get unique discount codes (10% off)
- Influencer earns 5% commission on sales
- No upfront payment

### 4. Quarterly Brand Competition

**"LAKOO Brand Star Challenge"**

**Frequency:** Every 3 months

**Who Can Enter:**
- New fashion brands (<2 years old)
- Indonesian designers
- Must have 10+ product SKUs

**Prizes:**

**Grand Prize (1 winner):**
- Becomes 16th official LAKOO brand
- Rp 500M investment
- 12-month contract
- Free photography, warehousing, fulfillment
- Dedicated brand manager
- Homepage placement for 3 months

**Runner-Up (2 winners):**
- Feature as third-party seller
- Rp 100M advertising credit
- Mentorship

**Top 10 Finalists:**
- Feature in LAKOO blog/social
- Rp 20M ad credit each

**Marketing Value:**
- 500+ brand submissions per quarter
- 50K+ social media engagements
- 100K+ live stream viewers (finals)
- National media coverage

### 5. Partnership Marketing

**Exclusive Releases with Established Brands:**

**Target Partners:**
- Global: Zara, Uniqlo, H&M
- Regional: Cotton On, Mango
- Local: Erigo, 3Second, This Is April

**Partnership Model:**
- Exclusive collection launch (only on LAKOO)
- Limited edition (1,000-5,000 units)
- 30-60 day exclusivity
- Co-branded campaign

**Value Proposition:**
- For Brand: Market testing, data insights, access to LAKOO customers
- For LAKOO: Borrowed credibility, traffic influx, PR coverage

**Example Deal:**
- Collection value: Rp 1B (retail)
- LAKOO offers: Rp 800M (20% discount)
- LAKOO pays partner: Rp 600M (includes Rp 100M subsidy)
- LAKOO margin: Rp 200M
- Real value: Customer acquisition (10,000 new customers)

**Frequency:** 4-5 major partnerships per quarter

---

## TECHNOLOGY STACK

### Frontend

**Web:**
- Framework: Next.js 14+ (React with SSR/ISR)
- State: Zustand or Redux
- Styling: Tailwind CSS + shadcn/ui components
- Real-time: Socket.io (live streaming, chat)

**Mobile:**
- Framework: React Native or Flutter
- State: Redux Toolkit (RN) or Riverpod (Flutter)
- Navigation: React Navigation or Flutter Navigator

### Backend

**Architecture:** Microservices

**Services:**
1. User/Auth Service - Authentication, user profiles
2. Brand Service - 15 brand management
3. Product Service - Product catalog (TypeScript → migrating to Go)
4. Warehouse Service - Inventory, grosir allocation
5. Order Service - Order management
6. Payment Service - Xendit integration, refunds
7. Logistics Service - Biteship integration, tracking
8. Seller Service - Third-party seller management
9. Advertising Service - Ad campaigns, tracking, billing
10. Notification Service - Email, SMS, push notifications
11. Live Streaming Service - Stream management, chat
12. Customer Service Service - Tickets, chat, refunds
13. Review Service - Product reviews, ratings
14. Analytics Service - Business intelligence, reports

**Language:** Node.js (TypeScript), Go (for performance-critical services)

**Framework:** Express.js (Node), Gin (Go)

**Database:** PostgreSQL (primary), Redis (caching, sessions)

**ORM:** Prisma (TypeScript), GORM (Go)

**API Gateway:** Kong or custom (routing, rate limiting, auth)

**Message Queue:** RabbitMQ or Kafka (async processing)

### Third-Party Integrations

**Payment:** Xendit (invoices, webhooks, disbursements)

**Logistics:** Biteship (rates, booking, tracking)

**Storage:** AWS S3 or Google Cloud Storage (images, videos)

**Email:** SendGrid or AWS SES (transactional, marketing)

**SMS:** Twilio or Infobip (OTP, notifications)

**Push Notifications:** Firebase Cloud Messaging

**WhatsApp:** Baileys or Twilio (factory POs, customer support)

**Live Streaming:** Agora, Mux, or AWS IVS (low-latency video)

**Search:** Elasticsearch or Algolia (product search)

**Analytics:** Google Analytics 4, Mixpanel (product analytics)

**Monitoring:** Sentry (errors), DataDog or New Relic (APM)

### Infrastructure

**Cloud:** AWS or Google Cloud Platform

**Containers:** Docker

**Orchestration:** Kubernetes (for scaling microservices)

**CI/CD:** GitHub Actions or GitLab CI

**CDN:** Cloudflare (fast global delivery of images/assets)

---

## TEAM STRUCTURE

### Leadership

- **CEO/Founder** - Overall vision and strategy
- **CTO** - Technology and product
- **CMO** - Marketing and brand management
- **COO** - Operations and logistics

### Technology Team (30-40 people)

**Backend Team (12-15):**
- 1 Backend Team Lead
- 2 devs on Order Service
- 2 devs on Brand/Product/Warehouse Services
- 2 devs on Seller/Advertising Services
- 2 devs on Customer Service/Review Services
- 2 devs on Live Streaming/Analytics
- 2 devs on Payment/Logistics/Notification

**Frontend Team (8-10):**
- 1 Frontend Team Lead
- 3-4 Web Developers (Next.js)
- 3-4 Mobile Developers (React Native/Flutter)

**DevOps (3):**
- 1 DevOps Lead
- 2 DevOps Engineers

**QA (5):**
- 1 QA Lead
- 4 QA Engineers

**Product (3):**
- 1 Product Manager (overall)
- 1 Product Manager (customer features)
- 1 Product Manager (seller features)

**Design (3-4):**
- 1 UI/UX Lead
- 2-3 UI/UX Designers

### Marketing & Content (40-50 people)

**Brand Management (15 Brand Account Managers):**
- Each manages 1 official LAKOO brand
- Responsibilities: Product curation, pricing, social media, campaigns

**Content Creation:**
- 5 Photography Teams (3-4 people each) = 15-20 people
- 3 Video Producers
- 2 Graphic Designers

**Live Streaming:**
- 1 Live Stream Director
- 2 Producers
- 3 Camera Operators
- 2 Community Managers (chat moderation)

**Performance Marketing:**
- 1 Marketing Manager
- 2 Paid Ads Specialists (Google, Facebook, TikTok)
- 1 SEO Specialist
- 1 Email Marketing Specialist

**Social Media:**
- 1 Social Media Manager
- 2 Social Media Specialists

### Operations (30-40 people)

**Warehouse:**
- 1 Warehouse Manager
- 1 Inventory Manager
- 3 Shift Supervisors
- 10-15 Warehouse Workers
- 3 Quality Control Inspectors
- 2 Receiving/Shipping Coordinators

**Customer Service:**
- 1 CS Manager
- 15-20 CS Agents (shifts to cover 8 AM - 10 PM)
- 3 CS Supervisors

**Seller Support:**
- 1 Seller Support Manager
- 5 Seller Support Agents

**Logistics:**
- 1 Logistics Manager
- 2 Logistics Coordinators

### Finance & Admin (8-10)

- 1 CFO/Finance Manager
- 2 Accountants
- 1 Finance Analyst
- 2 HR Managers
- 1 Office Manager
- 1-2 Admin Assistants

### TOTAL TEAM: ~120-140 people

---

## SUCCESS METRICS

### North Star Metric

**GMV (Gross Merchandise Value):** Total value of all orders (LAKOO brands + third-party sellers)

**Target Year 1:** Rp 60 Billion

### Key Performance Indicators (KPIs)

#### Customer Metrics

**Acquisition:**
- New users per month: Target 10,000
- Customer Acquisition Cost (CAC): Target <Rp 50,000
- Acquisition channels: Track organic vs. paid

**Engagement:**
- Monthly Active Users (MAU): Target 50,000
- Average Session Duration: Target >5 minutes
- Pages per Session: Target >5

**Conversion:**
- Overall Conversion Rate: Target 3-5%
- Add-to-Cart Rate: Target 15-20%
- Checkout Completion: Target 70%

**Retention:**
- Repeat Purchase Rate: Target 30% (within 90 days)
- Customer Lifetime Value (LTV): Target Rp 2,000,000
- LTV:CAC Ratio: Target >3:1

**Satisfaction:**
- Average Order Rating: Target 4.5/5
- Net Promoter Score (NPS): Target >50
- Return Rate: Target <5%

#### Brand Performance (15 Brands)

**Sales:**
- Revenue per brand per month: Target Rp 300M (average)
- Orders per brand per month: Target 1,500
- Average Order Value per brand: Target Rp 200K

**Growth:**
- Month-over-month growth: Target 15%
- Best performing brand revenue: Track
- Worst performing brand: Track for improvement/discontinuation

**Social Media:**
- Followers per brand: Target 10K within 6 months
- Engagement rate: Target >3%
- Traffic from social to storefront: Target 20%

#### Marketplace Performance (Third-Party Sellers)

**Seller Acquisition:**
- Active sellers: Target 300 within Year 1
- New seller signups per month: Target 30
- Seller approval rate: Target 80%

**Seller Activity:**
- Active sellers (≥1 sale/month): Target 70%
- Average products per seller: Target 20
- Average seller revenue: Target Rp 10M/month

**Advertising:**
- Sellers running ads: Target 25% (75 sellers)
- Average ad spend per advertiser: Target Rp 5M/month
- Ad revenue: Target Rp 350M/month

#### Operational Metrics

**Warehouse:**
- Inventory Turnover: Target 6-8x per year
- Order Fulfillment Time: Target <24 hours (in-stock items)
- Grosir Bundle Efficiency: Target >90% (minimize waste)
- Stock-Out Rate: Target <2%

**Logistics:**
- On-Time Delivery Rate: Target >95%
- Average Delivery Time: Target 3-5 days
- Damaged/Lost Package Rate: Target <0.5%

**Customer Service:**
- First Response Time: Target <5 minutes (chat)
- Resolution Time: Target <24 hours
- Customer Satisfaction (CSAT): Target >90%
- Ticket Volume: Monitor for trends

#### Financial Metrics

**Revenue:**
- Monthly Recurring Revenue (MRR): Track growth
- Revenue by source (brands vs. ads): Track ratio
- Revenue per customer: Target Rp 400K/year

**Costs:**
- Cost of Goods Sold (COGS): Target <40% of revenue
- Operating Expenses: Target <40% of revenue
- Customer Acquisition Cost (CAC): Target <Rp 50K

**Profitability:**
- Gross Margin: Target 60%
- Net Margin: Target 20%
- Break-even: Target Month 6-12

---

## GLOSSARY

**Grosir:** Indonesian term for "wholesale" - buying in bulk from factories

**Bundle:** Fixed grouping of product variants that factories ship together

**Tolerance:** Maximum excess inventory allowed per variant before locking

**Variant Locking:** Temporarily preventing orders of a size/variant due to grosir constraints

**Transfer Price:** Internal price warehouse charges platform for products

**GMV (Gross Merchandise Value):** Total value of all transactions (before deductions)

**CPC (Cost Per Click):** Advertising model where seller pays per ad click

**CPM (Cost Per Mille):** Advertising model where seller pays per 1000 impressions

**SKU (Stock Keeping Unit):** Unique identifier for each product variant

**MOQ (Minimum Order Quantity):** Minimum units required to complete order (old model, removed)

**LTV (Lifetime Value):** Total revenue expected from a customer over their lifetime

**CAC (Customer Acquisition Cost):** Cost to acquire one new customer

**AOV (Average Order Value):** Average amount spent per order

**NPS (Net Promoter Score):** Customer loyalty metric (-100 to +100)

**CSAT (Customer Satisfaction Score):** % of satisfied customers

---

## FREQUENTLY ASKED QUESTIONS

### General

**Q: What makes LAKOO different from Tokopedia/Shopee?**

A: LAKOO combines official curated brands (like Shein) with a 0% commission marketplace. We focus on fashion specifically, with professional photography, live shopping, and brand storytelling.

**Q: Why 15 brands instead of one?**

A: Different brands appeal to different customer segments. A teenager wants streetwear (LAKOO Street) while a professional wants elegant workwear (LAKOO Elite). Same warehouse, different positioning.

**Q: How do you make money if sellers pay 0% commission?**

A: We earn from (1) our 15 official brands with 50-60% margins, and (2) advertising revenue from sellers who want visibility.

### For Customers

**Q: Are LAKOO brands reliable quality?**

A: Yes. We control the entire supply chain: we select factories, inspect quality, and fulfill orders ourselves. Plus, 7-day returns if not satisfied.

**Q: What if a size is "locked" when I try to order?**

A: This means demand for other sizes is too low. We need balanced orders across all sizes to avoid wasting inventory. Check back in a few hours or choose another size.

**Q: Can I return items?**

A: Yes, 7-day return policy for LAKOO brand items. Third-party seller items depend on seller's policy (shown on product page).

### For Sellers

**Q: Really 0% commission?**

A: Yes, really. You keep 100% of your sales (minus payment gateway fees ~3%). We make money from advertising, not commissions.

**Q: Do I have to pay for ads?**

A: No, advertising is completely optional. You can sell for free. But ads help you get discovered faster.

**Q: Where do I ship from?**

A: Your own location. You manage your inventory and fulfillment. (Unlike LAKOO brand products which ship from our warehouse.)

**Q: Can I use LAKOO's photography studio?**

A: Yes, you can book time slots (paid service). Professional equipment and editing available.

### For Team Members

**Q: Who do I report to?**

A: Check the org chart (provided separately). Generally: Devs → Team Lead → CTO. Designers → Design Lead → CTO. Brand Managers → CMO.

**Q: What are the working hours?**

A: Tech team: Flexible (core hours 10 AM - 4 PM). Warehouse/CS: Shifts. Marketing: 9-6 PM with flexibility.

**Q: How do we make decisions?**

A: Weekly team meetings. Major decisions (features, campaigns) go through Product/Marketing review. Urgent decisions: Slack.

**Q: Where can I see our metrics?**

A: Internal dashboard (link provided on Day 1). Real-time revenue, orders, traffic. Updated every hour.

---

## QUICK REFERENCE

### Important Links

- Platform: https://lakoo.id (when launched)
- Internal Dashboard: [TBD]
- Warehouse System: [TBD]
- Slack: [TBD]
- GitHub: [TBD]
- Google Drive: [TBD]

### Key Contacts

- CEO: [Name, phone]
- CTO: [Name, phone]
- CMO: [Name, phone]
- COO: [Name, phone]
- HR: [Name, phone]
- IT Support: [Name, phone]

### Emergency Contacts

- Website Down: [On-call engineer rotation]
- Payment Issues: [Payment team lead]
- Warehouse Emergency: [Warehouse manager]
- Customer Crisis: [CS manager]

### Daily Standup

- Time: 10:00 AM (daily)
- Duration: 15 minutes
- Location: Main office / Zoom
- Format: What did you do yesterday? What will you do today? Any blockers?

### Company Values

1. **Customer First** - Every decision starts with "How does this help customers?"
2. **Quality Over Speed** - Ship when it's ready, not when it's rushed
3. **Transparency** - Share context, metrics, and decisions openly
4. **Ownership** - Take initiative, don't wait for permission
5. **Continuous Learning** - Experiment, measure, iterate, improve

---

## CHANGE LOG

**Version 1.0** (January 2026)
- Initial business model documentation
- Transition from group buying to multi-brand model complete
- 0% commission marketplace model finalized
- 15 brands defined
- Advertising system designed

---

**WELCOME TO LAKOO!**

This document contains everything you need to understand our business. Read it thoroughly on your first day. If you have questions, ask your manager or post in #new-employees on Slack.

Your first week:
- Day 1: Read this document, setup accounts, meet team
- Day 2-3: Shadow a team member in your role
- Day 4-5: Take on first tasks with guidance

We're building something special. Glad you're here! 🚀
