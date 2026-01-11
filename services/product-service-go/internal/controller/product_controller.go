package controller

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lakoo/product-service-go/internal/service"
	"github.com/lakoo/product-service-go/types"
)

type ProductController struct {
	service *service.ProductService
}

func NewProductController(svc *service.ProductService) *ProductController {
	return &ProductController{service: svc}
}

// POST /api/products
func (c *ProductController) CreateProduct(ctx *gin.Context) {
	var dto types.CreateProductDTO
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	product, err := c.service.CreateProduct(ctx.Request.Context(), dto)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, product)
}

// GET /api/products
func (c *ProductController) GetProducts(ctx *gin.Context) {
	var query types.ProductQuery
	if err := ctx.ShouldBindQuery(&query); err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	result, err := c.service.GetProducts(ctx.Request.Context(), query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, result)
}

// GET /api/products/:slug
func (c *ProductController) GetProductBySlug(ctx *gin.Context) {
	slug := ctx.Param("slug")

	product, err := c.service.GetProductBySlug(ctx.Request.Context(), slug)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			ctx.JSON(http.StatusNotFound, types.APIResponse{Success: false, Error: "Product not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, product)
}

// GET /api/products/id/:id
func (c *ProductController) GetProductByID(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: "Invalid product ID"})
		return
	}

	product, err := c.service.GetProductByID(ctx.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			ctx.JSON(http.StatusNotFound, types.APIResponse{Success: false, Error: "Product not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, product)
}

// PATCH /api/products/:id
func (c *ProductController) UpdateProduct(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: "Invalid product ID"})
		return
	}

	var dto types.UpdateProductDTO
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	product, err := c.service.UpdateProduct(ctx.Request.Context(), id, dto)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			ctx.JSON(http.StatusNotFound, types.APIResponse{Success: false, Error: "Product not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, product)
}

// PATCH /api/products/:id/publish
func (c *ProductController) PublishProduct(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: "Invalid product ID"})
		return
	}

	product, err := c.service.PublishProduct(ctx.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			ctx.JSON(http.StatusNotFound, types.APIResponse{Success: false, Error: "Product not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, product)
}

// DELETE /api/products/:id
func (c *ProductController) DeleteProduct(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: "Invalid product ID"})
		return
	}

	err = c.service.DeleteProduct(ctx.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			ctx.JSON(http.StatusNotFound, types.APIResponse{Success: false, Error: "Product not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	ctx.Status(http.StatusNoContent)
}

// POST /api/products/:id/images
func (c *ProductController) AddImages(ctx *gin.Context) {
	idStr := ctx.Param("id")
	productID, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: "Invalid product ID"})
		return
	}

	var dto types.AddImagesDTO
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	err = c.service.AddProductImages(ctx.Request.Context(), productID, dto.Images)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			ctx.JSON(http.StatusNotFound, types.APIResponse{Success: false, Error: "Product not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, types.APIResponse{Success: true, Message: "Images added successfully"})
}

// POST /api/products/:id/variants
func (c *ProductController) CreateVariant(ctx *gin.Context) {
	idStr := ctx.Param("id")
	productID, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: "Invalid product ID"})
		return
	}

	var dto types.CreateVariantDTO
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: err.Error()})
		return
	}
	dto.ProductID = productID

	variant, err := c.service.CreateVariant(ctx.Request.Context(), dto)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			ctx.JSON(http.StatusNotFound, types.APIResponse{Success: false, Error: "Product not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, variant)
}

// GET /api/products/variants/:variantId
func (c *ProductController) GetVariantByID(ctx *gin.Context) {
	variantIDStr := ctx.Param("variantId")
	variantID, err := uuid.Parse(variantIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, types.APIResponse{Success: false, Error: "Invalid variant ID"})
		return
	}

	variant, err := c.service.GetVariantByID(ctx.Request.Context(), variantID)
	if err != nil {
		if errors.Is(err, service.ErrVariantNotFound) {
			ctx.JSON(http.StatusNotFound, types.APIResponse{Success: false, Error: "Variant not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, types.APIResponse{Success: false, Error: err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, variant)
}
