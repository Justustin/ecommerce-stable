package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/lakoo/product-service-go/internal/repository"
	"github.com/lakoo/product-service-go/models"
	"github.com/lakoo/product-service-go/types"
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

func (s *ProductService) CreateProduct(ctx context.Context, dto types.CreateProductDTO) (*models.Product, error) {
	return s.repo.Create(ctx, dto)
}

func (s *ProductService) GetProducts(ctx context.Context, query types.ProductQuery) (*types.PaginatedResponse, error) {
	return s.repo.FindAll(ctx, query)
}

func (s *ProductService) GetProductByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	product, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return product, nil
}

func (s *ProductService) UpdateProduct(ctx context.Context, id uuid.UUID, dto types.UpdateProductDTO) (*models.Product, error) {
	product, err := s.repo.Update(ctx, id, dto)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return product, nil
}

func (s *ProductService) GetVariantByID(ctx context.Context, variantID uuid.UUID) (*models.ProductVariant, error) {
	variant, err := s.repo.FindVariantByID(ctx, variantID)
	if err != nil {
		return nil, err
	}
	if variant == nil {
		return nil, ErrVariantNotFound
	}
	return variant, nil
}

func (s *ProductService) CreateVariant(ctx context.Context, dto types.CreateVariantDTO) (*models.ProductVariant, error) {
	// Verify product exists
	product, err := s.repo.FindByID(ctx, dto.ProductID)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}

	return s.repo.CreateVariant(ctx, dto)
}

func (s *ProductService) GetProductBySlug(ctx context.Context, slug string) (*models.Product, error) {
	product, err := s.repo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return product, nil
}

func (s *ProductService) DeleteProduct(ctx context.Context, id uuid.UUID) error {
	product, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if product == nil {
		return ErrProductNotFound
	}
	return s.repo.Delete(ctx, id)
}

func (s *ProductService) AddProductImages(ctx context.Context, productID uuid.UUID, images []types.ImageInput) error {
	product, err := s.repo.FindByID(ctx, productID)
	if err != nil {
		return err
	}
	if product == nil {
		return ErrProductNotFound
	}
	return s.repo.AddImages(ctx, productID, images)
}

func (s *ProductService) PublishProduct(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	product, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return s.repo.Publish(ctx, id)
}
