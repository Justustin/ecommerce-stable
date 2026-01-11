# Product Service (Go)

A high-performance product catalog service for the LAKOO e-commerce platform, written in Go.

## Features

- Product CRUD operations with pagination
- Product variants (size, color, material)
- Product images management
- Supplier relationship (read-only reference)

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

### Variants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/variants/:variantId` | Get variant by ID |

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

This service works with these tables:

- `products` - Master product catalog (warehouse)
- `product_variants` - Size/color variations
- `product_images` - Product images
- `categories` - Categories (read for reference)
- `suppliers` - Suppliers (read for reference)

## Architecture

```
product-service-go/
├── cmd/
│   └── api/
│       └── main.go          # Application entry point
├── config/
│   └── config.go            # Configuration
├── db/
│   └── postgres.go          # Database connection
├── internal/
│   ├── controller/          # HTTP controllers
│   ├── repository/          # Database operations
│   └── service/             # Business logic
├── models/                  # Data models
├── types/                   # Request/Response DTOs
├── utils/                   # Utilities & middleware
├── Dockerfile
├── Makefile
└── go.mod
```
