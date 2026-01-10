package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lakoo/product-service-go/internal/models"
	"github.com/lakoo/product-service-go/pkg/database"
)

type ProductRepository struct {
	db *database.DB
}

func NewProductRepository(db *database.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) Create(ctx context.Context, req models.CreateProductRequest) (*models.Product, error) {
	id := uuid.New()
	slug := generateSlug(req.Name)
	now := time.Now()

	query := `
		INSERT INTO products (
			id, category_id, supplier_id, sku, name, slug, description,
			cost_price, weight_grams, length_cm, width_cm, height_cm,
			primary_image_url, grosir_unit_size, status, meta_title, meta_description,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
		) RETURNING *
	`

	product := &models.Product{}
	err := r.db.QueryRowContext(ctx, query,
		id, req.CategoryID, req.SupplierID, req.SKU, req.Name, slug, req.Description,
		req.CostPrice, req.WeightGrams, req.LengthCm, req.WidthCm, req.HeightCm,
		req.PrimaryImageURL, req.GrosirUnitSize, models.ProductStatusDraft, req.MetaTitle, req.MetaDescription,
		now, now,
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

	return product, nil
}

func (r *ProductRepository) FindBySlug(ctx context.Context, slug string) (*models.Product, error) {
	query := `
		SELECT id, category_id, supplier_id, sku, name, slug, description,
			cost_price, weight_grams, length_cm, width_cm, height_cm,
			primary_image_url, grosir_unit_size, status, meta_title, meta_description,
			published_at, created_at, updated_at
		FROM products WHERE slug = $1
	`

	product := &models.Product{}
	err := r.db.QueryRowContext(ctx, query, slug).Scan(
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
		return nil, fmt.Errorf("failed to find product by slug: %w", err)
	}

	return product, nil
}

func (r *ProductRepository) FindAll(ctx context.Context, query models.ProductQuery) ([]models.Product, int64, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	if query.CategoryID != nil {
		conditions = append(conditions, fmt.Sprintf("category_id = $%d", argNum))
		args = append(args, *query.CategoryID)
		argNum++
	}
	if query.SupplierID != nil {
		conditions = append(conditions, fmt.Sprintf("supplier_id = $%d", argNum))
		args = append(args, *query.SupplierID)
		argNum++
	}
	if query.Status != nil {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argNum))
		args = append(args, *query.Status)
		argNum++
	}
	if query.Search != nil && *query.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(name ILIKE $%d OR description ILIKE $%d)", argNum, argNum))
		args = append(args, "%"+*query.Search+"%")
		argNum++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM products %s", whereClause)
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count products: %w", err)
	}

	// Fetch products
	offset := (query.Page - 1) * query.Limit
	selectQuery := fmt.Sprintf(`
		SELECT id, category_id, supplier_id, sku, name, slug, description,
			cost_price, weight_grams, length_cm, width_cm, height_cm,
			primary_image_url, grosir_unit_size, status, meta_title, meta_description,
			published_at, created_at, updated_at
		FROM products %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argNum, argNum+1)

	args = append(args, query.Limit, offset)

	rows, err := r.db.QueryContext(ctx, selectQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query products: %w", err)
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		err := rows.Scan(
			&p.ID, &p.CategoryID, &p.SupplierID, &p.SKU, &p.Name,
			&p.Slug, &p.Description, &p.CostPrice, &p.WeightGrams,
			&p.LengthCm, &p.WidthCm, &p.HeightCm, &p.PrimaryImageURL,
			&p.GrosirUnitSize, &p.Status, &p.MetaTitle, &p.MetaDescription,
			&p.PublishedAt, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan product: %w", err)
		}
		products = append(products, p)
	}

	return products, total, nil
}

func (r *ProductRepository) Update(ctx context.Context, id uuid.UUID, req models.UpdateProductRequest) (*models.Product, error) {
	var setClauses []string
	var args []interface{}
	argNum := 1

	if req.CategoryID != nil {
		setClauses = append(setClauses, fmt.Sprintf("category_id = $%d", argNum))
		args = append(args, *req.CategoryID)
		argNum++
	}
	if req.SupplierID != nil {
		setClauses = append(setClauses, fmt.Sprintf("supplier_id = $%d", argNum))
		args = append(args, *req.SupplierID)
		argNum++
	}
	if req.Name != nil {
		setClauses = append(setClauses, fmt.Sprintf("name = $%d", argNum))
		args = append(args, *req.Name)
		argNum++
	}
	if req.Description != nil {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", argNum))
		args = append(args, *req.Description)
		argNum++
	}
	if req.CostPrice != nil {
		setClauses = append(setClauses, fmt.Sprintf("cost_price = $%d", argNum))
		args = append(args, *req.CostPrice)
		argNum++
	}
	if req.WeightGrams != nil {
		setClauses = append(setClauses, fmt.Sprintf("weight_grams = $%d", argNum))
		args = append(args, *req.WeightGrams)
		argNum++
	}
	if req.Status != nil {
		setClauses = append(setClauses, fmt.Sprintf("status = $%d", argNum))
		args = append(args, *req.Status)
		argNum++
	}
	if req.PrimaryImageURL != nil {
		setClauses = append(setClauses, fmt.Sprintf("primary_image_url = $%d", argNum))
		args = append(args, *req.PrimaryImageURL)
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

	return product, nil
}

func (r *ProductRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE products SET status = 'inactive', updated_at = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}
	return nil
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

// Variant operations
func (r *ProductRepository) CreateVariant(ctx context.Context, productID uuid.UUID, req models.CreateVariantRequest) (*models.ProductVariant, error) {
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
		id, productID, req.SKU, req.VariantName, req.Color, req.Size, req.Material,
		req.PriceAdjustment, req.WeightGrams, req.ImageURL, now,
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
		return nil, fmt.Errorf("failed to query variants: %w", err)
	}
	defer rows.Close()

	var variants []models.ProductVariant
	for rows.Next() {
		var v models.ProductVariant
		err := rows.Scan(
			&v.ID, &v.ProductID, &v.SKU, &v.VariantName,
			&v.Color, &v.Size, &v.Material, &v.PriceAdjustment,
			&v.WeightGrams, &v.ImageURL, &v.IsActive,
			&v.CreatedAt, &v.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan variant: %w", err)
		}
		variants = append(variants, v)
	}

	return variants, nil
}

// Image operations
func (r *ProductRepository) AddImages(ctx context.Context, productID uuid.UUID, images []models.ImageInput) error {
	for _, img := range images {
		id := uuid.New()
		query := `
			INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_primary, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`
		_, err := r.db.ExecContext(ctx, query, id, productID, img.ImageURL, img.AltText, img.DisplayOrder, img.IsPrimary, time.Now())
		if err != nil {
			return fmt.Errorf("failed to add image: %w", err)
		}
	}
	return nil
}

func (r *ProductRepository) FindImagesByProductID(ctx context.Context, productID uuid.UUID) ([]models.ProductImage, error) {
	query := `
		SELECT id, product_id, image_url, alt_text, display_order, is_primary, created_at
		FROM product_images WHERE product_id = $1 ORDER BY display_order
	`

	rows, err := r.db.QueryContext(ctx, query, productID)
	if err != nil {
		return nil, fmt.Errorf("failed to query images: %w", err)
	}
	defer rows.Close()

	var images []models.ProductImage
	for rows.Next() {
		var img models.ProductImage
		err := rows.Scan(&img.ID, &img.ProductID, &img.ImageURL, &img.AltText, &img.DisplayOrder, &img.IsPrimary, &img.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan image: %w", err)
		}
		images = append(images, img)
	}

	return images, nil
}

// Brand product assignment
func (r *ProductRepository) AssignToBrand(ctx context.Context, productID uuid.UUID, req models.AssignToBrandRequest) (*models.BrandProduct, error) {
	id := uuid.New()
	now := time.Now()

	query := `
		INSERT INTO brand_products (
			id, brand_id, product_id, brand_price, brand_compare_price, discount_percent,
			brand_product_name, brand_description, display_order, is_featured, is_bestseller,
			is_new_arrival, is_active, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, $13, $13)
		ON CONFLICT (brand_id, product_id) DO UPDATE SET
			brand_price = EXCLUDED.brand_price,
			brand_compare_price = EXCLUDED.brand_compare_price,
			discount_percent = EXCLUDED.discount_percent,
			brand_product_name = EXCLUDED.brand_product_name,
			brand_description = EXCLUDED.brand_description,
			display_order = EXCLUDED.display_order,
			is_featured = EXCLUDED.is_featured,
			is_bestseller = EXCLUDED.is_bestseller,
			is_new_arrival = EXCLUDED.is_new_arrival,
			updated_at = EXCLUDED.updated_at
		RETURNING id, brand_id, product_id, brand_price, brand_compare_price, discount_percent,
			brand_product_name, brand_description, display_order, is_featured, is_bestseller,
			is_new_arrival, is_active, created_at, updated_at
	`

	bp := &models.BrandProduct{}
	err := r.db.QueryRowContext(ctx, query,
		id, req.BrandID, productID, req.BrandPrice, req.BrandComparePrice, req.DiscountPercent,
		req.BrandProductName, req.BrandDescription, req.DisplayOrder, req.IsFeatured,
		req.IsBestseller, req.IsNewArrival, now,
	).Scan(
		&bp.ID, &bp.BrandID, &bp.ProductID, &bp.BrandPrice, &bp.BrandComparePrice,
		&bp.DiscountPercent, &bp.BrandProductName, &bp.BrandDescription, &bp.DisplayOrder,
		&bp.IsFeatured, &bp.IsBestseller, &bp.IsNewArrival, &bp.IsActive,
		&bp.CreatedAt, &bp.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to assign product to brand: %w", err)
	}

	return bp, nil
}

func (r *ProductRepository) FindBrandProductsByBrand(ctx context.Context, brandID uuid.UUID) ([]models.BrandProduct, error) {
	query := `
		SELECT bp.id, bp.brand_id, bp.product_id, bp.brand_price, bp.brand_compare_price,
			bp.discount_percent, bp.brand_product_name, bp.brand_description, bp.display_order,
			bp.is_featured, bp.is_bestseller, bp.is_new_arrival, bp.is_active, bp.created_at, bp.updated_at
		FROM brand_products bp
		WHERE bp.brand_id = $1 AND bp.is_active = true
		ORDER BY bp.display_order
	`

	rows, err := r.db.QueryContext(ctx, query, brandID)
	if err != nil {
		return nil, fmt.Errorf("failed to query brand products: %w", err)
	}
	defer rows.Close()

	var products []models.BrandProduct
	for rows.Next() {
		var bp models.BrandProduct
		err := rows.Scan(
			&bp.ID, &bp.BrandID, &bp.ProductID, &bp.BrandPrice, &bp.BrandComparePrice,
			&bp.DiscountPercent, &bp.BrandProductName, &bp.BrandDescription, &bp.DisplayOrder,
			&bp.IsFeatured, &bp.IsBestseller, &bp.IsNewArrival, &bp.IsActive,
			&bp.CreatedAt, &bp.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan brand product: %w", err)
		}
		products = append(products, bp)
	}

	return products, nil
}

// Helper functions
func generateSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "_", "-")
	// Remove special characters (basic implementation)
	var result strings.Builder
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			result.WriteRune(r)
		}
	}
	return result.String()
}
