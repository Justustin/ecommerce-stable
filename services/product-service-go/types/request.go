package types

import (
	"github.com/google/uuid"
	"github.com/lakoo/product-service-go/models"
	"github.com/shopspring/decimal"
)

type CreateProductDTO struct {
	CategoryID      uuid.UUID        `json:"category_id" binding:"required"`
	SupplierID      *uuid.UUID       `json:"supplier_id,omitempty"`
	SKU             string           `json:"sku" binding:"required"`
	Name            string           `json:"name" binding:"required"`
	Description     *string          `json:"description,omitempty"`
	CostPrice       decimal.Decimal  `json:"cost_price" binding:"required"`
	WeightGrams     *int             `json:"weight_grams,omitempty"`
	LengthCm        *decimal.Decimal `json:"length_cm,omitempty"`
	WidthCm         *decimal.Decimal `json:"width_cm,omitempty"`
	HeightCm        *decimal.Decimal `json:"height_cm,omitempty"`
	PrimaryImageURL *string          `json:"primary_image_url,omitempty"`
	GrosirUnitSize  *int             `json:"grosir_unit_size,omitempty"`
}

type UpdateProductDTO struct {
	Name            *string               `json:"name,omitempty"`
	Description     *string               `json:"description,omitempty"`
	CostPrice       *decimal.Decimal      `json:"cost_price,omitempty"`
	WeightGrams     *int                  `json:"weight_grams,omitempty"`
	LengthCm        *decimal.Decimal      `json:"length_cm,omitempty"`
	WidthCm         *decimal.Decimal      `json:"width_cm,omitempty"`
	HeightCm        *decimal.Decimal      `json:"height_cm,omitempty"`
	PrimaryImageURL *string               `json:"primary_image_url,omitempty"`
	Status          *models.ProductStatus `json:"status,omitempty"`
}

type CreateVariantDTO struct {
	ProductID       uuid.UUID        `json:"product_id"`
	SKU             string           `json:"sku" binding:"required"`
	VariantName     string           `json:"variant_name" binding:"required"`
	Color           *string          `json:"color,omitempty"`
	Size            *string          `json:"size,omitempty"`
	Material        *string          `json:"material,omitempty"`
	PriceAdjustment *decimal.Decimal `json:"price_adjustment,omitempty"`
	WeightGrams     *int             `json:"weight_grams,omitempty"`
	ImageURL        *string          `json:"image_url,omitempty"`
}

type ProductQuery struct {
	CategoryID *uuid.UUID `form:"category_id"`
	SupplierID *uuid.UUID `form:"supplier_id"`
	Status     *string    `form:"status"`
	Search     *string    `form:"search"`
	Page       int        `form:"page,default=1"`
	Limit      int        `form:"limit,default=20"`
}

type AddImagesDTO struct {
	Images []ImageInput `json:"images" binding:"required"`
}

type ImageInput struct {
	ImageURL  string `json:"image_url" binding:"required"`
	SortOrder int    `json:"sort_order"`
}
