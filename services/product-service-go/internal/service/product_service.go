package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/lakoo/product-service-go/internal/models"
	"github.com/lakoo/product-service-go/internal/repository"
)

var (
	ErrProductNotFound  = errors.New("product not found")
	ErrVariantNotFound  = errors.New("variant not found")
	ErrCategoryNotFound = errors.New("category not found")
)

type ProductService struct {
	productRepo  *repository.ProductRepository
	categoryRepo *repository.CategoryRepository
}

func NewProductService(productRepo *repository.ProductRepository, categoryRepo *repository.CategoryRepository) *ProductService {
	return &ProductService{
		productRepo:  productRepo,
		categoryRepo: categoryRepo,
	}
}

// Product operations
func (s *ProductService) CreateProduct(ctx context.Context, req models.CreateProductRequest) (*models.Product, error) {
	return s.productRepo.Create(ctx, req)
}

func (s *ProductService) GetProductByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	product, err := s.productRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}

	// Load related data
	product.Variants, _ = s.productRepo.FindVariantsByProductID(ctx, id)
	product.Images, _ = s.productRepo.FindImagesByProductID(ctx, id)
	product.Category, _ = s.categoryRepo.FindByID(ctx, product.CategoryID)

	return product, nil
}

func (s *ProductService) GetProductBySlug(ctx context.Context, slug string) (*models.Product, error) {
	product, err := s.productRepo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}

	// Load related data
	product.Variants, _ = s.productRepo.FindVariantsByProductID(ctx, product.ID)
	product.Images, _ = s.productRepo.FindImagesByProductID(ctx, product.ID)
	product.Category, _ = s.categoryRepo.FindByID(ctx, product.CategoryID)

	return product, nil
}

func (s *ProductService) GetProducts(ctx context.Context, query models.ProductQuery) (*models.PaginatedResponse, error) {
	if query.Page < 1 {
		query.Page = 1
	}
	if query.Limit < 1 || query.Limit > 100 {
		query.Limit = 20
	}

	products, total, err := s.productRepo.FindAll(ctx, query)
	if err != nil {
		return nil, err
	}

	totalPages := int(total) / query.Limit
	if int(total)%query.Limit > 0 {
		totalPages++
	}

	return &models.PaginatedResponse{
		Data: products,
		Pagination: models.Pagination{
			Total:      total,
			Page:       query.Page,
			Limit:      query.Limit,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *ProductService) UpdateProduct(ctx context.Context, id uuid.UUID, req models.UpdateProductRequest) (*models.Product, error) {
	product, err := s.productRepo.Update(ctx, id, req)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return product, nil
}

func (s *ProductService) DeleteProduct(ctx context.Context, id uuid.UUID) error {
	product, err := s.productRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if product == nil {
		return ErrProductNotFound
	}
	return s.productRepo.Delete(ctx, id)
}

func (s *ProductService) PublishProduct(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	product, err := s.productRepo.Publish(ctx, id)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return product, nil
}

// Variant operations
func (s *ProductService) CreateVariant(ctx context.Context, productID uuid.UUID, req models.CreateVariantRequest) (*models.ProductVariant, error) {
	product, err := s.productRepo.FindByID(ctx, productID)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return s.productRepo.CreateVariant(ctx, productID, req)
}

func (s *ProductService) GetVariantByID(ctx context.Context, variantID uuid.UUID) (*models.ProductVariant, error) {
	variant, err := s.productRepo.FindVariantByID(ctx, variantID)
	if err != nil {
		return nil, err
	}
	if variant == nil {
		return nil, ErrVariantNotFound
	}
	return variant, nil
}

// Image operations
func (s *ProductService) AddImages(ctx context.Context, productID uuid.UUID, images []models.ImageInput) error {
	product, err := s.productRepo.FindByID(ctx, productID)
	if err != nil {
		return err
	}
	if product == nil {
		return ErrProductNotFound
	}
	return s.productRepo.AddImages(ctx, productID, images)
}

// Brand assignment
func (s *ProductService) AssignToBrand(ctx context.Context, productID uuid.UUID, req models.AssignToBrandRequest) (*models.BrandProduct, error) {
	product, err := s.productRepo.FindByID(ctx, productID)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return s.productRepo.AssignToBrand(ctx, productID, req)
}

func (s *ProductService) GetBrandProducts(ctx context.Context, brandID uuid.UUID) ([]models.BrandProduct, error) {
	return s.productRepo.FindBrandProductsByBrand(ctx, brandID)
}

// Category operations
func (s *ProductService) CreateCategory(ctx context.Context, req models.CreateCategoryRequest) (*models.Category, error) {
	return s.categoryRepo.Create(ctx, req)
}

func (s *ProductService) GetCategoryByID(ctx context.Context, id uuid.UUID) (*models.Category, error) {
	category, err := s.categoryRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if category == nil {
		return nil, ErrCategoryNotFound
	}

	// Load children
	category.Children, _ = s.categoryRepo.FindChildren(ctx, id)

	return category, nil
}

func (s *ProductService) GetCategoryBySlug(ctx context.Context, slug string) (*models.Category, error) {
	category, err := s.categoryRepo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if category == nil {
		return nil, ErrCategoryNotFound
	}

	// Load children
	category.Children, _ = s.categoryRepo.FindChildren(ctx, category.ID)

	return category, nil
}

func (s *ProductService) GetAllCategories(ctx context.Context, activeOnly bool) ([]models.Category, error) {
	return s.categoryRepo.FindAll(ctx, activeOnly)
}

func (s *ProductService) GetRootCategories(ctx context.Context) ([]models.Category, error) {
	categories, err := s.categoryRepo.FindRootCategories(ctx)
	if err != nil {
		return nil, err
	}

	// Load children for each root category
	for i := range categories {
		categories[i].Children, _ = s.categoryRepo.FindChildren(ctx, categories[i].ID)
	}

	return categories, nil
}

func (s *ProductService) UpdateCategory(ctx context.Context, id uuid.UUID, req models.UpdateCategoryRequest) (*models.Category, error) {
	category, err := s.categoryRepo.Update(ctx, id, req)
	if err != nil {
		return nil, err
	}
	if category == nil {
		return nil, ErrCategoryNotFound
	}
	return category, nil
}

func (s *ProductService) DeleteCategory(ctx context.Context, id uuid.UUID) error {
	category, err := s.categoryRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if category == nil {
		return ErrCategoryNotFound
	}
	return s.categoryRepo.Delete(ctx, id)
}
