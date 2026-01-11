package repository

import (
	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"github.com/lakoo/product-service-go/models"
	"gorm.io/gorm"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) Create(product *models.Product) error {
	product.ID = uuid.New()
	product.Slug = slug.Make(product.Name)
	product.Status = "draft"
	return r.db.Create(product).Error
}

func (r *ProductRepository) FindAll(filter map[string]interface{}, page, limit int) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	query := r.db.Model(&models.Product{})

	// Apply filters
	if supplierID, ok := filter["supplier_id"]; ok && supplierID != nil {
		query = query.Where("supplier_id = ?", supplierID)
	}
	if categoryID, ok := filter["category_id"]; ok && categoryID != nil {
		query = query.Where("category_id = ?", categoryID)
	}
	if status, ok := filter["status"]; ok && status != nil {
		query = query.Where("status = ?", status)
	}
	if search, ok := filter["search"]; ok && search != nil && search != "" {
		searchTerm := "%" + search.(string) + "%"
		query = query.Where("name ILIKE ? OR description ILIKE ?", searchTerm, searchTerm)
	}

	// Count total
	query.Count(&total)

	// Paginate and fetch with relations
	offset := (page - 1) * limit
	err := query.
		Preload("Category").
		Preload("Supplier").
		Preload("Images", func(db *gorm.DB) *gorm.DB {
			return db.Order("display_order ASC")
		}).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&products).Error

	return products, total, err
}

func (r *ProductRepository) FindBySlug(productSlug string) (*models.Product, error) {
	var product models.Product
	err := r.db.
		Preload("Category").
		Preload("Supplier").
		Preload("Images", func(db *gorm.DB) *gorm.DB {
			return db.Order("display_order ASC")
		}).
		Preload("Variants").
		Where("slug = ?", productSlug).
		First(&product).Error

	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &product, err
}

func (r *ProductRepository) FindByID(id uuid.UUID) (*models.Product, error) {
	var product models.Product
	err := r.db.
		Preload("Category").
		Preload("Supplier").
		Preload("Images", func(db *gorm.DB) *gorm.DB {
			return db.Order("display_order ASC")
		}).
		Preload("Variants").
		Where("id = ?", id).
		First(&product).Error

	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &product, err
}

func (r *ProductRepository) Update(id uuid.UUID, updates map[string]interface{}) (*models.Product, error) {
	result := r.db.Model(&models.Product{}).Where("id = ?", id).Updates(updates)
	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, nil
	}
	return r.FindByID(id)
}

func (r *ProductRepository) Delete(id uuid.UUID) error {
	return r.db.Model(&models.Product{}).Where("id = ?", id).Update("status", "inactive").Error
}

func (r *ProductRepository) Publish(id uuid.UUID) (*models.Product, error) {
	result := r.db.Model(&models.Product{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":       "active",
		"published_at": gorm.Expr("NOW()"),
	})
	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, nil
	}
	return r.FindByID(id)
}

func (r *ProductRepository) AddImages(productID uuid.UUID, images []models.ProductImage) error {
	for i := range images {
		images[i].ID = uuid.New()
		images[i].ProductID = productID
	}
	return r.db.Create(&images).Error
}

func (r *ProductRepository) CreateVariant(variant *models.ProductVariant) error {
	variant.ID = uuid.New()
	return r.db.Create(variant).Error
}

func (r *ProductRepository) FindVariantByID(variantID uuid.UUID) (*models.ProductVariant, error) {
	var variant models.ProductVariant
	err := r.db.
		Preload("Product").
		Where("id = ?", variantID).
		First(&variant).Error

	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &variant, err
}
