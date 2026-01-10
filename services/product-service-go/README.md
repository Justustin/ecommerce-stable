# Product Service (Go)

A high-performance product catalog service for the LAKOO e-commerce platform, written in Go.

## Features

- Product CRUD operations with pagination
- Product variants (size, color, material)
- Product images management
- Category management with hierarchical structure
- Brand product assignments with brand-specific pricing
- Multi-brand support (15 official LAKOO brands)

## Tech Stack

- **Language**: Go 1.21+
- **Framework**: Gin (HTTP router)
- **Database**: PostgreSQL
- **UUID**: Google UUID

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create a new product |
| GET | `/api/products` | List products with pagination |
| GET | `/api/products/:slug` | Get product by slug |
| GET | `/api/products/id/:id` | Get product by ID |
| PATCH | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Soft delete product |
| PATCH | `/api/products/:id/publish` | Publish product |
| POST | `/api/products/:id/images` | Add images |
| POST | `/api/products/:id/variants` | Create variant |
| POST | `/api/products/:id/brands` | Assign to brand |

### Variants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/variants/:variantId` | Get variant by ID |

### Brand Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/brands/:brandId/products` | Get products for a brand |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/categories` | Create category |
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/tree` | Get category tree |
| GET | `/api/categories/:slug` | Get by slug |
| GET | `/api/categories/id/:id` | Get by ID |
| PATCH | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Soft delete category |

## Getting Started

### Prerequisites

- Go 1.21 or higher
- PostgreSQL database

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your database credentials
4. Install dependencies:
   ```bash
   make deps
   ```
5. Run the service:
   ```bash
   make run
   ```

### Development

Run with hot reload (requires [air](https://github.com/cosmtrek/air)):
```bash
make dev
```

### Testing

```bash
make test
```

### Docker

Build image:
```bash
make docker-build
```

Run container:
```bash
make docker-run
```

## Database Schema

This service works with the new LAKOO schema:

- `products` - Master product catalog (warehouse)
- `product_variants` - Size/color variations
- `product_images` - Product images
- `categories` - Hierarchical categories
- `suppliers` - External suppliers
- `brands` - 15 official LAKOO brands
- `brand_products` - Product-brand assignments with brand-specific pricing

## Architecture

```
product-service-go/
├── cmd/
│   └── server/
│       └── main.go          # Application entry point
├── internal/
│   ├── config/              # Configuration
│   ├── models/              # Data models & DTOs
│   ├── repository/          # Database operations
│   ├── service/             # Business logic
│   ├── handler/             # HTTP handlers
│   └── middleware/          # HTTP middleware
├── pkg/
│   └── database/            # Database connection
├── Dockerfile
├── Makefile
└── go.mod
```
