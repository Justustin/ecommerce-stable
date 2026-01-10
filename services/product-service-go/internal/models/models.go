package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// Product status enum
type ProductStatus string

const (
	ProductStatusDraft      ProductStatus = "draft"
	ProductStatusActive     ProductStatus = "active"
	ProductStatusInactive   ProductStatus = "inactive"
	ProductStatusOutOfStock ProductStatus = "out_of_stock"
)

// Product represents the warehouse master product catalog
type Product struct {
	ID              uuid.UUID       `json:"id" db:"id"`
	CategoryID      uuid.UUID       `json:"category_id" db:"category_id"`
	SupplierID      *uuid.UUID      `json:"supplier_id,omitempty" db:"supplier_id"`
	SKU             string          `json:"sku" db:"sku"`
	Name            string          `json:"name" db:"name"`
	Slug            string          `json:"slug" db:"slug"`
	Description     *string         `json:"description,omitempty" db:"description"`
	CostPrice       decimal.Decimal `json:"cost_price" db:"cost_price"`
	WeightGrams     *int            `json:"weight_grams,omitempty" db:"weight_grams"`
	LengthCm        *decimal.Decimal `json:"length_cm,omitempty" db:"length_cm"`
	WidthCm         *decimal.Decimal `json:"width_cm,omitempty" db:"width_cm"`
	HeightCm        *decimal.Decimal `json:"height_cm,omitempty" db:"height_cm"`
	PrimaryImageURL *string         `json:"primary_image_url,omitempty" db:"primary_image_url"`
	GrosirUnitSize  *int            `json:"grosir_unit_size,omitempty" db:"grosir_unit_size"`
	Status          ProductStatus   `json:"status" db:"status"`
	MetaTitle       *string         `json:"meta_title,omitempty" db:"meta_title"`
	MetaDescription *string         `json:"meta_description,omitempty" db:"meta_description"`
	PublishedAt     *time.Time      `json:"published_at,omitempty" db:"published_at"`
	CreatedAt       time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at" db:"updated_at"`

	// Relations (populated separately)
	Category *Category        `json:"category,omitempty"`
	Supplier *Supplier        `json:"supplier,omitempty"`
	Variants []ProductVariant `json:"variants,omitempty"`
	Images   []ProductImage   `json:"images,omitempty"`
}

// ProductVariant represents size/color variations
type ProductVariant struct {
	ID              uuid.UUID        `json:"id" db:"id"`
	ProductID       uuid.UUID        `json:"product_id" db:"product_id"`
	SKU             string           `json:"sku" db:"sku"`
	VariantName     string           `json:"variant_name" db:"variant_name"`
	Color           *string          `json:"color,omitempty" db:"color"`
	Size            *string          `json:"size,omitempty" db:"size"`
	Material        *string          `json:"material,omitempty" db:"material"`
	PriceAdjustment *decimal.Decimal `json:"price_adjustment,omitempty" db:"price_adjustment"`
	WeightGrams     *int             `json:"weight_grams,omitempty" db:"weight_grams"`
	ImageURL        *string          `json:"image_url,omitempty" db:"image_url"`
	IsActive        bool             `json:"is_active" db:"is_active"`
	CreatedAt       time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at" db:"updated_at"`
}

// ProductImage represents additional product images
type ProductImage struct {
	ID           uuid.UUID `json:"id" db:"id"`
	ProductID    uuid.UUID `json:"product_id" db:"product_id"`
	ImageURL     string    `json:"image_url" db:"image_url"`
	AltText      *string   `json:"alt_text,omitempty" db:"alt_text"`
	DisplayOrder int       `json:"display_order" db:"display_order"`
	IsPrimary    bool      `json:"is_primary" db:"is_primary"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// Category represents product categories with hierarchy
type Category struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	ParentID     *uuid.UUID `json:"parent_id,omitempty" db:"parent_id"`
	Name         string     `json:"name" db:"name"`
	Slug         string     `json:"slug" db:"slug"`
	Description  *string    `json:"description,omitempty" db:"description"`
	ImageURL     *string    `json:"image_url,omitempty" db:"image_url"`
	DisplayOrder int        `json:"display_order" db:"display_order"`
	IsActive     bool       `json:"is_active" db:"is_active"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`

	// Relations
	Children []Category `json:"children,omitempty"`
}

// Supplier represents factories/suppliers that supply to warehouse
type Supplier struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	SupplierCode   string     `json:"supplier_code" db:"supplier_code"`
	SupplierName   string     `json:"supplier_name" db:"supplier_name"`
	ContactPerson  *string    `json:"contact_person,omitempty" db:"contact_person"`
	Email          *string    `json:"email,omitempty" db:"email"`
	PhoneNumber    *string    `json:"phone_number,omitempty" db:"phone_number"`
	WhatsappNumber *string    `json:"whatsapp_number,omitempty" db:"whatsapp_number"`
	Address        *string    `json:"address,omitempty" db:"address"`
	City           *string    `json:"city,omitempty" db:"city"`
	PostalCode     *string    `json:"postal_code,omitempty" db:"postal_code"`
	Status         string     `json:"status" db:"status"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at" db:"updated_at"`
}

// Brand represents the 15 official LAKOO brands
type Brand struct {
	ID                   uuid.UUID        `json:"id" db:"id"`
	BrandCode            string           `json:"brand_code" db:"brand_code"`
	BrandName            string           `json:"brand_name" db:"brand_name"`
	Slug                 string           `json:"slug" db:"slug"`
	LogoURL              *string          `json:"logo_url,omitempty" db:"logo_url"`
	BannerURL            *string          `json:"banner_url,omitempty" db:"banner_url"`
	PrimaryColor         *string          `json:"primary_color,omitempty" db:"primary_color"`
	SecondaryColor       *string          `json:"secondary_color,omitempty" db:"secondary_color"`
	BrandStory           *string          `json:"brand_story,omitempty" db:"brand_story"`
	Tagline              *string          `json:"tagline,omitempty" db:"tagline"`
	TargetAudience       *string          `json:"target_audience,omitempty" db:"target_audience"`
	StyleCategory        *string          `json:"style_category,omitempty" db:"style_category"`
	DefaultMarginPercent *decimal.Decimal `json:"default_margin_percent,omitempty" db:"default_margin_percent"`
	Status               string           `json:"status" db:"status"`
	DisplayOrder         int              `json:"display_order" db:"display_order"`
	CreatedAt            time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time        `json:"updated_at" db:"updated_at"`
}

// BrandProduct represents products assigned to brands with brand-specific pricing
type BrandProduct struct {
	ID                uuid.UUID        `json:"id" db:"id"`
	BrandID           uuid.UUID        `json:"brand_id" db:"brand_id"`
	ProductID         uuid.UUID        `json:"product_id" db:"product_id"`
	BrandPrice        decimal.Decimal  `json:"brand_price" db:"brand_price"`
	BrandComparePrice *decimal.Decimal `json:"brand_compare_price,omitempty" db:"brand_compare_price"`
	DiscountPercent   *decimal.Decimal `json:"discount_percent,omitempty" db:"discount_percent"`
	BrandProductName  *string          `json:"brand_product_name,omitempty" db:"brand_product_name"`
	BrandDescription  *string          `json:"brand_description,omitempty" db:"brand_description"`
	DisplayOrder      int              `json:"display_order" db:"display_order"`
	IsFeatured        bool             `json:"is_featured" db:"is_featured"`
	IsBestseller      bool             `json:"is_bestseller" db:"is_bestseller"`
	IsNewArrival      bool             `json:"is_new_arrival" db:"is_new_arrival"`
	IsActive          bool             `json:"is_active" db:"is_active"`
	CreatedAt         time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time        `json:"updated_at" db:"updated_at"`

	// Relations
	Brand   *Brand   `json:"brand,omitempty"`
	Product *Product `json:"product,omitempty"`
}
