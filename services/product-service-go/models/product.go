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
	ID              uuid.UUID        `json:"id" gorm:"type:uuid;primaryKey"`
	CategoryID      uuid.UUID        `json:"category_id" gorm:"type:uuid;not null"`
	SupplierID      *uuid.UUID       `json:"supplier_id,omitempty" gorm:"type:uuid"`
	SKU             string           `json:"sku" gorm:"uniqueIndex;not null"`
	Name            string           `json:"name" gorm:"not null"`
	Slug            string           `json:"slug" gorm:"uniqueIndex;not null"`
	Description     *string          `json:"description,omitempty"`
	CostPrice       decimal.Decimal  `json:"cost_price" gorm:"type:decimal(12,2);not null"`
	WeightGrams     *int             `json:"weight_grams,omitempty"`
	LengthCm        *decimal.Decimal `json:"length_cm,omitempty" gorm:"type:decimal(8,2)"`
	WidthCm         *decimal.Decimal `json:"width_cm,omitempty" gorm:"type:decimal(8,2)"`
	HeightCm        *decimal.Decimal `json:"height_cm,omitempty" gorm:"type:decimal(8,2)"`
	PrimaryImageURL *string          `json:"primary_image_url,omitempty"`
	GrosirUnitSize  *int             `json:"grosir_unit_size,omitempty"`
	Status          ProductStatus    `json:"status" gorm:"type:product_status;default:'draft'"`
	MetaTitle       *string          `json:"meta_title,omitempty"`
	MetaDescription *string          `json:"meta_description,omitempty"`
	PublishedAt     *time.Time       `json:"published_at,omitempty"`
	CreatedAt       time.Time        `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt       time.Time        `json:"updated_at" gorm:"autoUpdateTime"`

	// Relations
	Category *Category        `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Supplier *Supplier        `json:"supplier,omitempty" gorm:"foreignKey:SupplierID"`
	Variants []ProductVariant `json:"variants,omitempty" gorm:"foreignKey:ProductID"`
	Images   []ProductImage   `json:"images,omitempty" gorm:"foreignKey:ProductID"`
}

func (Product) TableName() string {
	return "products"
}

type ProductVariant struct {
	ID              uuid.UUID        `json:"id" gorm:"type:uuid;primaryKey"`
	ProductID       uuid.UUID        `json:"product_id" gorm:"type:uuid;not null"`
	SKU             string           `json:"sku" gorm:"uniqueIndex;not null"`
	VariantName     string           `json:"variant_name" gorm:"not null"`
	Color           *string          `json:"color,omitempty"`
	Size            *string          `json:"size,omitempty"`
	Material        *string          `json:"material,omitempty"`
	PriceAdjustment *decimal.Decimal `json:"price_adjustment,omitempty" gorm:"type:decimal(12,2)"`
	WeightGrams     *int             `json:"weight_grams,omitempty"`
	ImageURL        *string          `json:"image_url,omitempty"`
	IsActive        bool             `json:"is_active" gorm:"default:true"`
	CreatedAt       time.Time        `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt       time.Time        `json:"updated_at" gorm:"autoUpdateTime"`

	// Relations
	Product *Product `json:"product,omitempty" gorm:"foreignKey:ProductID"`
}

func (ProductVariant) TableName() string {
	return "product_variants"
}

type ProductImage struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	ProductID    uuid.UUID `json:"product_id" gorm:"type:uuid;not null"`
	ImageURL     string    `json:"image_url" gorm:"not null"`
	AltText      *string   `json:"alt_text,omitempty"`
	DisplayOrder int       `json:"display_order" gorm:"default:0"`
	IsPrimary    bool      `json:"is_primary" gorm:"default:false"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
}

func (ProductImage) TableName() string {
	return "product_images"
}

type Category struct {
	ID           uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey"`
	ParentID     *uuid.UUID `json:"parent_id,omitempty" gorm:"type:uuid"`
	Name         string     `json:"name" gorm:"not null"`
	Slug         string     `json:"slug" gorm:"uniqueIndex;not null"`
	Description  *string    `json:"description,omitempty"`
	ImageURL     *string    `json:"image_url,omitempty"`
	DisplayOrder int        `json:"display_order" gorm:"default:0"`
	IsActive     bool       `json:"is_active" gorm:"default:true"`
	CreatedAt    time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
}

func (Category) TableName() string {
	return "categories"
}

type Supplier struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	SupplierCode string    `json:"supplier_code" gorm:"uniqueIndex;not null"`
	SupplierName string    `json:"supplier_name" gorm:"not null"`
	City         *string   `json:"city,omitempty"`
}

func (Supplier) TableName() string {
	return "suppliers"
}
