package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"github.com/lakoo/product-service-go/db"
	"github.com/lakoo/product-service-go/models"
	"github.com/lakoo/product-service-go/types"
)

type ProductRepository struct {
	db *db.DB
}

func NewProductRepository(database *db.DB) *ProductRepository {
	return &ProductRepository{db: database}
}

func (r *ProductRepository) Create(ctx context.Context, dto types.CreateProductDTO) (*models.Product, error) {
	id := uuid.New()
	productSlug := slug.Make(dto.Name)
	now := time.Now()

	query := `
		INSERT INTO products (
			id, category_id, supplier_id, sku, name, slug, description,
			cost_price, weight_grams, length_cm, width_cm, height_cm,
			primary_image_url, grosir_unit_size, status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'draft', $15, $15)
		RETURNING id, category_id, supplier_id, sku, name, slug, description,
			cost_price, weight_grams, length_cm, width_cm, height_cm,
			primary_image_url, grosir_unit_size, status, meta_title, meta_description,
			published_at, created_at, updated_at
	`

	product := &models.Product{}
	err := r.db.QueryRowContext(ctx, query,
		id, dto.CategoryID, dto.SupplierID, dto.SKU, dto.Name, productSlug, dto.Description,
		dto.CostPrice, dto.WeightGrams, dto.LengthCm, dto.WidthCm, dto.HeightCm,
		dto.PrimaryImageURL, dto.GrosirUnitSize, now,
	).Scan(
		&product.ID, &product.CategoryID, &product.SupplierID, &product.SKU, &product.Name,
		&product.Slug, &product.Description, &product.CostPrice, &product.WeightGrams,
		&product.LengthCm, &product.WidthCm, &product.HeightCm, &product.PrimaryImageURL,
		&product.GrosirUnitSize, &product.Status, &product.MetaTitle, &product.MetaDescription,
		&product.PublishedAt, &product.CreatedAt, &product.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}

	// Load category and supplier
	product.Category, _ = r.findCategoryByID(ctx, product.CategoryID)
	if product.SupplierID != nil {
		product.Supplier, _ = r.findSupplierByID(ctx, *product.SupplierID)
	}

	return product, nil
}

func (r *ProductRepository) FindAll(ctx context.Context, query types.ProductQuery) (*types.PaginatedResponse, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	if query.SupplierID != nil {
		conditions = append(conditions, fmt.Sprintf("p.supplier_id = $%d", argNum))
		args = append(args, *query.SupplierID)
		argNum++
	}
	if query.CategoryID != nil {
		conditions = append(conditions, fmt.Sprintf("p.category_id = $%d", argNum))
		args = append(args, *query.CategoryID)
		argNum++
	}
	if query.Status != nil {
		conditions = append(conditions, fmt.Sprintf("p.status = $%d", argNum))
		args = append(args, *query.Status)
		argNum++
	}
	if query.Search != nil && *query.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(p.name ILIKE $%d OR p.description ILIKE $%d)", argNum, argNum))
		args = append(args, "%"+*query.Search+"%")
		argNum++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM products p %s", whereClause)
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count products: %w", err)
	}

	// Fetch products
	if query.Page < 1 {
		query.Page = 1
	}
	if query.Limit < 1 {
		query.Limit = 20
	}
	offset := (query.Page - 1) * query.Limit

	selectQuery := fmt.Sprintf(`
		SELECT p.id, p.category_id, p.supplier_id, p.sku, p.name, p.slug, p.description,
			p.cost_price, p.weight_grams, p.length_cm, p.width_cm, p.height_cm,
			p.primary_image_url, p.grosir_unit_size, p.status, p.meta_title, p.meta_description,
			p.published_at, p.created_at, p.updated_at
		FROM products p %s
		ORDER BY p.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argNum, argNum+1)

	args = append(args, query.Limit, offset)

	rows, err := r.db.QueryContext(ctx, selectQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query products: %w", err)
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		err := rows.Scan(
			&p.ID, &p.CategoryID, &p.SupplierID, &p.SKU, &p.Name, &p.Slug, &p.Description,
			&p.CostPrice, &p.WeightGrams, &p.LengthCm, &p.WidthCm, &p.HeightCm,
			&p.PrimaryImageURL, &p.GrosirUnitSize, &p.Status, &p.MetaTitle, &p.MetaDescription,
			&p.PublishedAt, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}

		// Load relations
		p.Category, _ = r.findCategoryByID(ctx, p.CategoryID)
		if p.SupplierID != nil {
			p.Supplier, _ = r.findSupplierByID(ctx, *p.SupplierID)
		}
		p.Images, _ = r.FindImagesByProductID(ctx, p.ID)

		products = append(products, p)
	}

	totalPages := int(total) / query.Limit
	if int(total)%query.Limit > 0 {
		totalPages++
	}

	return &types.PaginatedResponse{
		Products: products,
		Pagination: types.Pagination{
			Total:      total,
			Page:       query.Page,
			Limit:      query.Limit,
			TotalPages: totalPages,
		},
	}, nil
}

func (r *ProductRepository) FindBySlug(ctx context.Context, productSlug string) (*models.Product, error) {
	query := `
		SELECT id, category_id, supplier_id, sku, name, slug, description,
			cost_price, weight_grams, length_cm, width_cm, height_cm,
			primary_image_url, grosir_unit_size, status, meta_title, meta_description,
			published_at, created_at, updated_at
		FROM products WHERE slug = $1
	`

	product := &models.Product{}
	err := r.db.QueryRowContext(ctx, query, productSlug).Scan(
		&product.ID, &product.CategoryID, &product.SupplierID, &product.SKU, &product.Name,
		&product.Slug, &product.Description, &product.CostPrice, &product.WeightGrams,
		&product.LengthCm, &product.WidthCm, &product.HeightCm, &product.PrimaryImageURL,
		&product.GrosirUnitSize, &product.Status, &product.MetaTitle, &product.MetaDescription,
		&product.PublishedAt, &product.CreatedAt, &product.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find product: %w", err)
	}

	// Load relations
	product.Category, _ = r.findCategoryByID(ctx, product.CategoryID)
	if product.SupplierID != nil {
		product.Supplier, _ = r.findSupplierByID(ctx, *product.SupplierID)
	}
	product.Images, _ = r.FindImagesByProductID(ctx, product.ID)
	product.Variants, _ = r.FindVariantsByProductID(ctx, product.ID)

	return product, nil
}

func (r *ProductRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	query := `
		SELECT id, category_id, supplier_id, sku, name, slug, description,
			cost_price, weight_grams, length_cm, width_cm, height_cm,
			primary_image_url, grosir_unit_size, status, meta_title, meta_description,
			published_at, created_at, updated_at
		FROM products WHERE id = $1
	`

	product := &models.Product{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&product.ID, &product.CategoryID, &product.SupplierID, &product.SKU, &product.Name,
		&product.Slug, &product.Description, &product.CostPrice, &product.WeightGrams,
		&product.LengthCm, &product.WidthCm, &product.HeightCm, &product.PrimaryImageURL,
		&product.GrosirUnitSize, &product.Status, &product.MetaTitle, &product.MetaDescription,
		&product.PublishedAt, &product.CreatedAt, &product.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find product: %w", err)
	}

	// Load relations
	product.Category, _ = r.findCategoryByID(ctx, product.CategoryID)
	if product.SupplierID != nil {
		product.Supplier, _ = r.findSupplierByID(ctx, *product.SupplierID)
	}
	product.Images, _ = r.FindImagesByProductID(ctx, product.ID)
	product.Variants, _ = r.FindVariantsByProductID(ctx, product.ID)

	return product, nil
}

func (r *ProductRepository) Update(ctx context.Context, id uuid.UUID, dto types.UpdateProductDTO) (*models.Product, error) {
	var setClauses []string
	var args []interface{}
	argNum := 1

	if dto.Name != nil {
		setClauses = append(setClauses, fmt.Sprintf("name = $%d", argNum))
		args = append(args, *dto.Name)
		argNum++
	}
	if dto.Description != nil {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", argNum))
		args = append(args, *dto.Description)
		argNum++
	}
	if dto.CostPrice != nil {
		setClauses = append(setClauses, fmt.Sprintf("cost_price = $%d", argNum))
		args = append(args, *dto.CostPrice)
		argNum++
	}
	if dto.WeightGrams != nil {
		setClauses = append(setClauses, fmt.Sprintf("weight_grams = $%d", argNum))
		args = append(args, *dto.WeightGrams)
		argNum++
	}
	if dto.Status != nil {
		setClauses = append(setClauses, fmt.Sprintf("status = $%d", argNum))
		args = append(args, *dto.Status)
		argNum++
	}
	if dto.PrimaryImageURL != nil {
		setClauses = append(setClauses, fmt.Sprintf("primary_image_url = $%d", argNum))
		args = append(args, *dto.PrimaryImageURL)
		argNum++
	}
	if dto.LengthCm != nil {
		setClauses = append(setClauses, fmt.Sprintf("length_cm = $%d", argNum))
		args = append(args, *dto.LengthCm)
		argNum++
	}
	if dto.WidthCm != nil {
		setClauses = append(setClauses, fmt.Sprintf("width_cm = $%d", argNum))
		args = append(args, *dto.WidthCm)
		argNum++
	}
	if dto.HeightCm != nil {
		setClauses = append(setClauses, fmt.Sprintf("height_cm = $%d", argNum))
		args = append(args, *dto.HeightCm)
		argNum++
	}

	if len(setClauses) == 0 {
		return r.FindByID(ctx, id)
	}

	setClauses = append(setClauses, fmt.Sprintf("updated_at = $%d", argNum))
	args = append(args, time.Now())
	argNum++

	args = append(args, id)

	query := fmt.Sprintf(`
		UPDATE products SET %s WHERE id = $%d
		RETURNING id, category_id, supplier_id, sku, name, slug, description,
			cost_price, weight_grams, length_cm, width_cm, height_cm,
			primary_image_url, grosir_unit_size, status, meta_title, meta_description,
			published_at, created_at, updated_at
	`, strings.Join(setClauses, ", "), argNum)

	product := &models.Product{}
	err := r.db.QueryRowContext(ctx, query, args...).Scan(
		&product.ID, &product.CategoryID, &product.SupplierID, &product.SKU, &product.Name,
		&product.Slug, &product.Description, &product.CostPrice, &product.WeightGrams,
		&product.LengthCm, &product.WidthCm, &product.HeightCm, &product.PrimaryImageURL,
		&product.GrosirUnitSize, &product.Status, &product.MetaTitle, &product.MetaDescription,
		&product.PublishedAt, &product.CreatedAt, &product.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to update product: %w", err)
	}

	// Load relations
	product.Category, _ = r.findCategoryByID(ctx, product.CategoryID)
	product.Images, _ = r.FindImagesByProductID(ctx, product.ID)

	return product, nil
}

func (r *ProductRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE products SET status = 'inactive', updated_at = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, time.Now(), id)
	return err
}

func (r *ProductRepository) Publish(ctx context.Context, id uuid.UUID) (*models.Product, error) {
	now := time.Now()
	query := `
		UPDATE products SET status = 'active', published_at = $1, updated_at = $1 WHERE id = $2
		RETURNING id, category_id, supplier_id, sku, name, slug, description,
			cost_price, weight_grams, length_cm, width_cm, height_cm,
			primary_image_url, grosir_unit_size, status, meta_title, meta_description,
			published_at, created_at, updated_at
	`

	product := &models.Product{}
	err := r.db.QueryRowContext(ctx, query, now, id).Scan(
		&product.ID, &product.CategoryID, &product.SupplierID, &product.SKU, &product.Name,
		&product.Slug, &product.Description, &product.CostPrice, &product.WeightGrams,
		&product.LengthCm, &product.WidthCm, &product.HeightCm, &product.PrimaryImageURL,
		&product.GrosirUnitSize, &product.Status, &product.MetaTitle, &product.MetaDescription,
		&product.PublishedAt, &product.CreatedAt, &product.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to publish product: %w", err)
	}

	return product, nil
}

func (r *ProductRepository) AddImages(ctx context.Context, productID uuid.UUID, images []types.ImageInput) error {
	for _, img := range images {
		id := uuid.New()
		query := `
			INSERT INTO product_images (id, product_id, image_url, display_order, created_at)
			VALUES ($1, $2, $3, $4, $5)
		`
		_, err := r.db.ExecContext(ctx, query, id, productID, img.ImageURL, img.SortOrder, time.Now())
		if err != nil {
			return fmt.Errorf("failed to add image: %w", err)
		}
	}
	return nil
}

func (r *ProductRepository) CreateVariant(ctx context.Context, dto types.CreateVariantDTO) (*models.ProductVariant, error) {
	id := uuid.New()
	now := time.Now()

	query := `
		INSERT INTO product_variants (
			id, product_id, sku, variant_name, color, size, material,
			price_adjustment, weight_grams, image_url, is_active, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11, $11)
		RETURNING id, product_id, sku, variant_name, color, size, material,
			price_adjustment, weight_grams, image_url, is_active, created_at, updated_at
	`

	variant := &models.ProductVariant{}
	err := r.db.QueryRowContext(ctx, query,
		id, dto.ProductID, dto.SKU, dto.VariantName, dto.Color, dto.Size, dto.Material,
		dto.PriceAdjustment, dto.WeightGrams, dto.ImageURL, now,
	).Scan(
		&variant.ID, &variant.ProductID, &variant.SKU, &variant.VariantName,
		&variant.Color, &variant.Size, &variant.Material, &variant.PriceAdjustment,
		&variant.WeightGrams, &variant.ImageURL, &variant.IsActive,
		&variant.CreatedAt, &variant.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create variant: %w", err)
	}

	return variant, nil
}

func (r *ProductRepository) FindVariantByID(ctx context.Context, variantID uuid.UUID) (*models.ProductVariant, error) {
	query := `
		SELECT id, product_id, sku, variant_name, color, size, material,
			price_adjustment, weight_grams, image_url, is_active, created_at, updated_at
		FROM product_variants WHERE id = $1
	`

	variant := &models.ProductVariant{}
	err := r.db.QueryRowContext(ctx, query, variantID).Scan(
		&variant.ID, &variant.ProductID, &variant.SKU, &variant.VariantName,
		&variant.Color, &variant.Size, &variant.Material, &variant.PriceAdjustment,
		&variant.WeightGrams, &variant.ImageURL, &variant.IsActive,
		&variant.CreatedAt, &variant.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find variant: %w", err)
	}

	// Load product info
	variant.Product, _ = r.FindByID(ctx, variant.ProductID)

	return variant, nil
}

func (r *ProductRepository) FindVariantsByProductID(ctx context.Context, productID uuid.UUID) ([]models.ProductVariant, error) {
	query := `
		SELECT id, product_id, sku, variant_name, color, size, material,
			price_adjustment, weight_grams, image_url, is_active, created_at, updated_at
		FROM product_variants WHERE product_id = $1 ORDER BY created_at
	`

	rows, err := r.db.QueryContext(ctx, query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variants []models.ProductVariant
	for rows.Next() {
		var v models.ProductVariant
		err := rows.Scan(
			&v.ID, &v.ProductID, &v.SKU, &v.VariantName, &v.Color, &v.Size, &v.Material,
			&v.PriceAdjustment, &v.WeightGrams, &v.ImageURL, &v.IsActive,
			&v.CreatedAt, &v.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		variants = append(variants, v)
	}

	return variants, nil
}

func (r *ProductRepository) FindImagesByProductID(ctx context.Context, productID uuid.UUID) ([]models.ProductImage, error) {
	query := `
		SELECT id, product_id, image_url, alt_text, display_order, is_primary, created_at
		FROM product_images WHERE product_id = $1 ORDER BY display_order
	`

	rows, err := r.db.QueryContext(ctx, query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var images []models.ProductImage
	for rows.Next() {
		var img models.ProductImage
		err := rows.Scan(&img.ID, &img.ProductID, &img.ImageURL, &img.AltText, &img.DisplayOrder, &img.IsPrimary, &img.CreatedAt)
		if err != nil {
			return nil, err
		}
		images = append(images, img)
	}

	return images, nil
}

// Helper methods
func (r *ProductRepository) findCategoryByID(ctx context.Context, id uuid.UUID) (*models.Category, error) {
	query := `SELECT id, parent_id, name, slug, description, image_url, display_order, is_active, created_at, updated_at FROM categories WHERE id = $1`

	cat := &models.Category{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&cat.ID, &cat.ParentID, &cat.Name, &cat.Slug, &cat.Description,
		&cat.ImageURL, &cat.DisplayOrder, &cat.IsActive, &cat.CreatedAt, &cat.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return cat, nil
}

func (r *ProductRepository) findSupplierByID(ctx context.Context, id uuid.UUID) (*models.Supplier, error) {
	query := `SELECT id, supplier_code, supplier_name, city FROM suppliers WHERE id = $1`

	sup := &models.Supplier{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(&sup.ID, &sup.SupplierCode, &sup.SupplierName, &sup.City)
	if err != nil {
		return nil, err
	}
	return sup, nil
}
