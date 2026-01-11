package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/lakoo/product-service-go/internal/repository"
	"github.com/lakoo/product-service-go/models"
	"github.com/lakoo/product-service-go/types"
	"github.com/lakoo/product-service-go/utils"
)

var (
	ErrProductNotFound = errors.New("product not found")
	ErrVariantNotFound = errors.New("variant not found")
)

type ProductService struct {
	repo *repository.ProductRepository
}

func NewProductService(repo *repository.ProductRepository) *ProductService {
	return &ProductService{repo: repo}
}

func (s *ProductService) CreateProduct(dto types.CreateProductDTO) (*models.Product, error) {
	product := &models.Product{
		CategoryID:      dto.CategoryID,
		SupplierID:      dto.SupplierID,
		SKU:             dto.SKU,
		Name:            dto.Name,
		Description:     dto.Description,
		CostPrice:       dto.CostPrice,
		WeightGrams:     dto.WeightGrams,
		LengthCm:        dto.LengthCm,
		WidthCm:         dto.WidthCm,
		HeightCm:        dto.HeightCm,
		PrimaryImageURL: dto.PrimaryImageURL,
		GrosirUnitSize:  dto.GrosirUnitSize,
	}

	if err := s.repo.Create(product); err != nil {
		return nil, err
	}

	return s.repo.FindByID(product.ID)
}

func (s *ProductService) GetProducts(filterPayload types.ProductFilterPayload) (*types.PaginatedResponse, error) {
	filter, err := utils.PayloadToMap(filterPayload)
	if err != nil {
		return nil, err
	}

	page := filterPayload.Page
	limit := filterPayload.Limit
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	products, total, err := s.repo.FindAll(filter, page, limit)
	if err != nil {
		return nil, err
	}

	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	return &types.PaginatedResponse{
		Products: products,
		Pagination: types.Pagination{
			Total:      total,
			Page:       page,
			Limit:      limit,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *ProductService) GetProductByID(id uuid.UUID) (*models.Product, error) {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return product, nil
}

func (s *ProductService) GetProductBySlug(slug string) (*models.Product, error) {
	product, err := s.repo.FindBySlug(slug)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return product, nil
}

func (s *ProductService) UpdateProduct(id uuid.UUID, dto types.UpdateProductDTO) (*models.Product, error) {
	updates, err := utils.PayloadToMap(dto)
	if err != nil {
		return nil, err
	}

	product, err := s.repo.Update(id, updates)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return product, nil
}

func (s *ProductService) DeleteProduct(id uuid.UUID) error {
	product, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	if product == nil {
		return ErrProductNotFound
	}
	return s.repo.Delete(id)
}

func (s *ProductService) PublishProduct(id uuid.UUID) (*models.Product, error) {
	product, err := s.repo.Publish(id)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return product, nil
}

func (s *ProductService) AddProductImages(productID uuid.UUID, imagesDTO []types.ImageInput) error {
	product, err := s.repo.FindByID(productID)
	if err != nil {
		return err
	}
	if product == nil {
		return ErrProductNotFound
	}

	var images []models.ProductImage
	for _, img := range imagesDTO {
		images = append(images, models.ProductImage{
			ImageURL:     img.ImageURL,
			DisplayOrder: img.SortOrder,
		})
	}

	return s.repo.AddImages(productID, images)
}

func (s *ProductService) CreateVariant(productID uuid.UUID, dto types.CreateVariantDTO) (*models.ProductVariant, error) {
	product, err := s.repo.FindByID(productID)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}

	variant := &models.ProductVariant{
		ProductID:       productID,
		SKU:             dto.SKU,
		VariantName:     dto.VariantName,
		Color:           dto.Color,
		Size:            dto.Size,
		Material:        dto.Material,
		PriceAdjustment: dto.PriceAdjustment,
		WeightGrams:     dto.WeightGrams,
		ImageURL:        dto.ImageURL,
		IsActive:        true,
	}

	if err := s.repo.CreateVariant(variant); err != nil {
		return nil, err
	}

	return s.repo.FindVariantByID(variant.ID)
}

func (s *ProductService) GetVariantByID(variantID uuid.UUID) (*models.ProductVariant, error) {
	variant, err := s.repo.FindVariantByID(variantID)
	if err != nil {
		return nil, err
	}
	if variant == nil {
		return nil, ErrVariantNotFound
	}
	return variant, nil
}
