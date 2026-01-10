package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lakoo/product-service-go/internal/models"
	"github.com/lakoo/product-service-go/internal/service"
)

type ProductHandler struct {
	service *service.ProductService
}

func NewProductHandler(svc *service.ProductService) *ProductHandler {
	return &ProductHandler{service: svc}
}

// CreateProduct creates a new product
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	product, err := h.service.CreateProduct(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Data:    product,
	})
}

// GetProducts returns paginated list of products
func (h *ProductHandler) GetProducts(c *gin.Context) {
	var query models.ProductQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	result, err := h.service.GetProducts(c.Request.Context(), query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    result,
	})
}

// GetProductByID returns a product by its ID
func (h *ProductHandler) GetProductByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "invalid product ID",
		})
		return
	}

	product, err := h.service.GetProductByID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    product,
	})
}

// GetProductBySlug returns a product by its slug
func (h *ProductHandler) GetProductBySlug(c *gin.Context) {
	slug := c.Param("slug")

	product, err := h.service.GetProductBySlug(c.Request.Context(), slug)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    product,
	})
}

// UpdateProduct updates an existing product
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "invalid product ID",
		})
		return
	}

	var req models.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	product, err := h.service.UpdateProduct(c.Request.Context(), id, req)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    product,
	})
}

// DeleteProduct soft deletes a product
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "invalid product ID",
		})
		return
	}

	err = h.service.DeleteProduct(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// PublishProduct publishes a draft product
func (h *ProductHandler) PublishProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "invalid product ID",
		})
		return
	}

	product, err := h.service.PublishProduct(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    product,
	})
}

// CreateVariant creates a new product variant
func (h *ProductHandler) CreateVariant(c *gin.Context) {
	idStr := c.Param("id")
	productID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "invalid product ID",
		})
		return
	}

	var req models.CreateVariantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	variant, err := h.service.CreateVariant(c.Request.Context(), productID, req)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Data:    variant,
	})
}

// GetVariantByID returns a variant by its ID
func (h *ProductHandler) GetVariantByID(c *gin.Context) {
	variantIDStr := c.Param("variantId")
	variantID, err := uuid.Parse(variantIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "invalid variant ID",
		})
		return
	}

	variant, err := h.service.GetVariantByID(c.Request.Context(), variantID)
	if err != nil {
		if errors.Is(err, service.ErrVariantNotFound) {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "variant not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    variant,
	})
}

// AddImages adds images to a product
func (h *ProductHandler) AddImages(c *gin.Context) {
	idStr := c.Param("id")
	productID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "invalid product ID",
		})
		return
	}

	var req models.AddImagesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	err = h.service.AddImages(c.Request.Context(), productID, req.Images)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "images added successfully",
	})
}

// AssignToBrand assigns a product to a brand with brand-specific pricing
func (h *ProductHandler) AssignToBrand(c *gin.Context) {
	idStr := c.Param("id")
	productID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "invalid product ID",
		})
		return
	}

	var req models.AssignToBrandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	brandProduct, err := h.service.AssignToBrand(c.Request.Context(), productID, req)
	if err != nil {
		if errors.Is(err, service.ErrProductNotFound) {
			c.JSON(http.StatusNotFound, models.APIResponse{
				Success: false,
				Error:   "product not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Data:    brandProduct,
	})
}

// GetBrandProducts returns all products for a brand
func (h *ProductHandler) GetBrandProducts(c *gin.Context) {
	brandIDStr := c.Param("brandId")
	brandID, err := uuid.Parse(brandIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "invalid brand ID",
		})
		return
	}

	products, err := h.service.GetBrandProducts(c.Request.Context(), brandID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    products,
	})
}
