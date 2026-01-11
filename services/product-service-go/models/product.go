package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type ProductStatus string

const (
	ProductStatusDraft    ProductStatus = "draft"
	ProductStatusActive   ProductStatus = "active"
	ProductStatusInactive ProductStatus = "inactive"
)

type Product struct {
	ID              uuid.UUID        `json:"id"`
	CategoryID      uuid.UUID        `json:"category_id"`
	SupplierID      *uuid.UUID       `json:"supplier_id,omitempty"`
	SKU             string           `json:"sku"`
	Name            string           `json:"name"`
	Slug            string           `json:"slug"`
	Description     *string          `json:"description,omitempty"`
	CostPrice       decimal.Decimal  `json:"cost_price"`
	WeightGrams     *int             `json:"weight_grams,omitempty"`
	LengthCm        *decimal.Decimal `json:"length_cm,omitempty"`
	WidthCm         *decimal.Decimal `json:"width_cm,omitempty"`
	HeightCm        *decimal.Decimal `json:"height_cm,omitempty"`
	PrimaryImageURL *string          `json:"primary_image_url,omitempty"`
	GrosirUnitSize  *int             `json:"grosir_unit_size,omitempty"`
	Status          ProductStatus    `json:"status"`
	MetaTitle       *string          `json:"meta_title,omitempty"`
	MetaDescription *string          `json:"meta_description,omitempty"`
	PublishedAt     *time.Time       `json:"published_at,omitempty"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`

	// Relations
	Category *Category        `json:"category,omitempty"`
	Supplier *Supplier        `json:"supplier,omitempty"`
	Variants []ProductVariant `json:"variants,omitempty"`
	Images   []ProductImage   `json:"images,omitempty"`
}

type ProductVariant struct {
	ID              uuid.UUID        `json:"id"`
	ProductID       uuid.UUID        `json:"product_id"`
	SKU             string           `json:"sku"`
	VariantName     string           `json:"variant_name"`
	Color           *string          `json:"color,omitempty"`
	Size            *string          `json:"size,omitempty"`
	Material        *string          `json:"material,omitempty"`
	PriceAdjustment *decimal.Decimal `json:"price_adjustment,omitempty"`
	WeightGrams     *int             `json:"weight_grams,omitempty"`
	ImageURL        *string          `json:"image_url,omitempty"`
	IsActive        bool             `json:"is_active"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`

	// Relations
	Product *Product `json:"product,omitempty"`
}

type ProductImage struct {
	ID           uuid.UUID `json:"id"`
	ProductID    uuid.UUID `json:"product_id"`
	ImageURL     string    `json:"image_url"`
	AltText      *string   `json:"alt_text,omitempty"`
	DisplayOrder int       `json:"display_order"`
	IsPrimary    bool      `json:"is_primary"`
	CreatedAt    time.Time `json:"created_at"`
}

type Category struct {
	ID           uuid.UUID  `json:"id"`
	ParentID     *uuid.UUID `json:"parent_id,omitempty"`
	Name         string     `json:"name"`
	Slug         string     `json:"slug"`
	Description  *string    `json:"description,omitempty"`
	ImageURL     *string    `json:"image_url,omitempty"`
	DisplayOrder int        `json:"display_order"`
	IsActive     bool       `json:"is_active"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

type Supplier struct {
	ID           uuid.UUID `json:"id"`
	SupplierCode string    `json:"supplier_code"`
	SupplierName string    `json:"supplier_name"`
	City         *string   `json:"city,omitempty"`
}
