package models

import (
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// CreateProductRequest for creating new products
type CreateProductRequest struct {
	CategoryID      uuid.UUID       `json:"category_id" binding:"required"`
	SupplierID      *uuid.UUID      `json:"supplier_id,omitempty"`
	SKU             string          `json:"sku" binding:"required"`
	Name            string          `json:"name" binding:"required"`
	Description     *string         `json:"description,omitempty"`
	CostPrice       decimal.Decimal `json:"cost_price" binding:"required"`
	WeightGrams     *int            `json:"weight_grams,omitempty"`
	LengthCm        *decimal.Decimal `json:"length_cm,omitempty"`
	WidthCm         *decimal.Decimal `json:"width_cm,omitempty"`
	HeightCm        *decimal.Decimal `json:"height_cm,omitempty"`
	PrimaryImageURL *string         `json:"primary_image_url,omitempty"`
	GrosirUnitSize  *int            `json:"grosir_unit_size,omitempty"`
	MetaTitle       *string         `json:"meta_title,omitempty"`
	MetaDescription *string         `json:"meta_description,omitempty"`
}

// UpdateProductRequest for updating products
type UpdateProductRequest struct {
	CategoryID      *uuid.UUID       `json:"category_id,omitempty"`
	SupplierID      *uuid.UUID       `json:"supplier_id,omitempty"`
	Name            *string          `json:"name,omitempty"`
	Description     *string          `json:"description,omitempty"`
	CostPrice       *decimal.Decimal `json:"cost_price,omitempty"`
	WeightGrams     *int             `json:"weight_grams,omitempty"`
	LengthCm        *decimal.Decimal `json:"length_cm,omitempty"`
	WidthCm         *decimal.Decimal `json:"width_cm,omitempty"`
	HeightCm        *decimal.Decimal `json:"height_cm,omitempty"`
	PrimaryImageURL *string          `json:"primary_image_url,omitempty"`
	GrosirUnitSize  *int             `json:"grosir_unit_size,omitempty"`
	Status          *ProductStatus   `json:"status,omitempty"`
	MetaTitle       *string          `json:"meta_title,omitempty"`
	MetaDescription *string          `json:"meta_description,omitempty"`
}

// CreateVariantRequest for creating product variants
type CreateVariantRequest struct {
	SKU             string           `json:"sku" binding:"required"`
	VariantName     string           `json:"variant_name" binding:"required"`
	Color           *string          `json:"color,omitempty"`
	Size            *string          `json:"size,omitempty"`
	Material        *string          `json:"material,omitempty"`
	PriceAdjustment *decimal.Decimal `json:"price_adjustment,omitempty"`
	WeightGrams     *int             `json:"weight_grams,omitempty"`
	ImageURL        *string          `json:"image_url,omitempty"`
}

// AddImagesRequest for adding product images
type AddImagesRequest struct {
	Images []ImageInput `json:"images" binding:"required"`
}

type ImageInput struct {
	ImageURL     string  `json:"image_url" binding:"required"`
	AltText      *string `json:"alt_text,omitempty"`
	DisplayOrder int     `json:"display_order"`
	IsPrimary    bool    `json:"is_primary"`
}

// ProductQuery for filtering products
type ProductQuery struct {
	CategoryID *uuid.UUID `form:"category_id"`
	SupplierID *uuid.UUID `form:"supplier_id"`
	BrandID    *uuid.UUID `form:"brand_id"`
	Status     *string    `form:"status"`
	Search     *string    `form:"search"`
	Page       int        `form:"page,default=1"`
	Limit      int        `form:"limit,default=20"`
}

// PaginatedResponse for paginated results
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
}

type Pagination struct {
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	TotalPages int   `json:"total_pages"`
}

// AssignToBrandRequest for assigning product to a brand
type AssignToBrandRequest struct {
	BrandID           uuid.UUID        `json:"brand_id" binding:"required"`
	BrandPrice        decimal.Decimal  `json:"brand_price" binding:"required"`
	BrandComparePrice *decimal.Decimal `json:"brand_compare_price,omitempty"`
	DiscountPercent   *decimal.Decimal `json:"discount_percent,omitempty"`
	BrandProductName  *string          `json:"brand_product_name,omitempty"`
	BrandDescription  *string          `json:"brand_description,omitempty"`
	DisplayOrder      int              `json:"display_order"`
	IsFeatured        bool             `json:"is_featured"`
	IsBestseller      bool             `json:"is_bestseller"`
	IsNewArrival      bool             `json:"is_new_arrival"`
}

// CreateCategoryRequest for creating categories
type CreateCategoryRequest struct {
	ParentID     *uuid.UUID `json:"parent_id,omitempty"`
	Name         string     `json:"name" binding:"required"`
	Description  *string    `json:"description,omitempty"`
	ImageURL     *string    `json:"image_url,omitempty"`
	DisplayOrder int        `json:"display_order"`
}

// UpdateCategoryRequest for updating categories
type UpdateCategoryRequest struct {
	ParentID     *uuid.UUID `json:"parent_id,omitempty"`
	Name         *string    `json:"name,omitempty"`
	Description  *string    `json:"description,omitempty"`
	ImageURL     *string    `json:"image_url,omitempty"`
	DisplayOrder *int       `json:"display_order,omitempty"`
	IsActive     *bool      `json:"is_active,omitempty"`
}

// APIResponse standard API response wrapper
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}
