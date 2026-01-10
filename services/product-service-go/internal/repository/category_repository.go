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

type CategoryRepository struct {
	db *database.DB
}

func NewCategoryRepository(db *database.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(ctx context.Context, req models.CreateCategoryRequest) (*models.Category, error) {
	id := uuid.New()
	slug := generateSlug(req.Name)
	now := time.Now()

	query := `
		INSERT INTO categories (id, parent_id, name, slug, description, image_url, display_order, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $8)
		RETURNING id, parent_id, name, slug, description, image_url, display_order, is_active, created_at, updated_at
	`

	category := &models.Category{}
	err := r.db.QueryRowContext(ctx, query,
		id, req.ParentID, req.Name, slug, req.Description, req.ImageURL, req.DisplayOrder, now,
	).Scan(
		&category.ID, &category.ParentID, &category.Name, &category.Slug,
		&category.Description, &category.ImageURL, &category.DisplayOrder,
		&category.IsActive, &category.CreatedAt, &category.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}

	return category, nil
}

func (r *CategoryRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Category, error) {
	query := `
		SELECT id, parent_id, name, slug, description, image_url, display_order, is_active, created_at, updated_at
		FROM categories WHERE id = $1
	`

	category := &models.Category{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&category.ID, &category.ParentID, &category.Name, &category.Slug,
		&category.Description, &category.ImageURL, &category.DisplayOrder,
		&category.IsActive, &category.CreatedAt, &category.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find category: %w", err)
	}

	return category, nil
}

func (r *CategoryRepository) FindBySlug(ctx context.Context, slug string) (*models.Category, error) {
	query := `
		SELECT id, parent_id, name, slug, description, image_url, display_order, is_active, created_at, updated_at
		FROM categories WHERE slug = $1
	`

	category := &models.Category{}
	err := r.db.QueryRowContext(ctx, query, slug).Scan(
		&category.ID, &category.ParentID, &category.Name, &category.Slug,
		&category.Description, &category.ImageURL, &category.DisplayOrder,
		&category.IsActive, &category.CreatedAt, &category.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to find category by slug: %w", err)
	}

	return category, nil
}

func (r *CategoryRepository) FindAll(ctx context.Context, activeOnly bool) ([]models.Category, error) {
	query := `
		SELECT id, parent_id, name, slug, description, image_url, display_order, is_active, created_at, updated_at
		FROM categories
	`
	if activeOnly {
		query += " WHERE is_active = true"
	}
	query += " ORDER BY display_order, name"

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query categories: %w", err)
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var c models.Category
		err := rows.Scan(
			&c.ID, &c.ParentID, &c.Name, &c.Slug,
			&c.Description, &c.ImageURL, &c.DisplayOrder,
			&c.IsActive, &c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan category: %w", err)
		}
		categories = append(categories, c)
	}

	return categories, nil
}

func (r *CategoryRepository) FindRootCategories(ctx context.Context) ([]models.Category, error) {
	query := `
		SELECT id, parent_id, name, slug, description, image_url, display_order, is_active, created_at, updated_at
		FROM categories WHERE parent_id IS NULL AND is_active = true
		ORDER BY display_order, name
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query root categories: %w", err)
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var c models.Category
		err := rows.Scan(
			&c.ID, &c.ParentID, &c.Name, &c.Slug,
			&c.Description, &c.ImageURL, &c.DisplayOrder,
			&c.IsActive, &c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan category: %w", err)
		}
		categories = append(categories, c)
	}

	return categories, nil
}

func (r *CategoryRepository) FindChildren(ctx context.Context, parentID uuid.UUID) ([]models.Category, error) {
	query := `
		SELECT id, parent_id, name, slug, description, image_url, display_order, is_active, created_at, updated_at
		FROM categories WHERE parent_id = $1 AND is_active = true
		ORDER BY display_order, name
	`

	rows, err := r.db.QueryContext(ctx, query, parentID)
	if err != nil {
		return nil, fmt.Errorf("failed to query child categories: %w", err)
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var c models.Category
		err := rows.Scan(
			&c.ID, &c.ParentID, &c.Name, &c.Slug,
			&c.Description, &c.ImageURL, &c.DisplayOrder,
			&c.IsActive, &c.CreatedAt, &c.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan category: %w", err)
		}
		categories = append(categories, c)
	}

	return categories, nil
}

func (r *CategoryRepository) Update(ctx context.Context, id uuid.UUID, req models.UpdateCategoryRequest) (*models.Category, error) {
	var setClauses []string
	var args []interface{}
	argNum := 1

	if req.ParentID != nil {
		setClauses = append(setClauses, fmt.Sprintf("parent_id = $%d", argNum))
		args = append(args, *req.ParentID)
		argNum++
	}
	if req.Name != nil {
		setClauses = append(setClauses, fmt.Sprintf("name = $%d", argNum))
		args = append(args, *req.Name)
		argNum++
		setClauses = append(setClauses, fmt.Sprintf("slug = $%d", argNum))
		args = append(args, generateSlug(*req.Name))
		argNum++
	}
	if req.Description != nil {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", argNum))
		args = append(args, *req.Description)
		argNum++
	}
	if req.ImageURL != nil {
		setClauses = append(setClauses, fmt.Sprintf("image_url = $%d", argNum))
		args = append(args, *req.ImageURL)
		argNum++
	}
	if req.DisplayOrder != nil {
		setClauses = append(setClauses, fmt.Sprintf("display_order = $%d", argNum))
		args = append(args, *req.DisplayOrder)
		argNum++
	}
	if req.IsActive != nil {
		setClauses = append(setClauses, fmt.Sprintf("is_active = $%d", argNum))
		args = append(args, *req.IsActive)
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
		UPDATE categories SET %s WHERE id = $%d
		RETURNING id, parent_id, name, slug, description, image_url, display_order, is_active, created_at, updated_at
	`, strings.Join(setClauses, ", "), argNum)

	category := &models.Category{}
	err := r.db.QueryRowContext(ctx, query, args...).Scan(
		&category.ID, &category.ParentID, &category.Name, &category.Slug,
		&category.Description, &category.ImageURL, &category.DisplayOrder,
		&category.IsActive, &category.CreatedAt, &category.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to update category: %w", err)
	}

	return category, nil
}

func (r *CategoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE categories SET is_active = false, updated_at = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}
	return nil
}
