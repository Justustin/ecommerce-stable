-- Migration: Simplify Grosir Inventory System
-- Date: 2025-11-24
-- Description: Replace confusing grosir tables with simplified warehouse inventory model

-- ============================================================================
-- STEP 1: Drop old confusing tables
-- ============================================================================

-- Drop foreign key constraints first
ALTER TABLE IF EXISTS grosir_bundle_config
  DROP CONSTRAINT IF EXISTS fk_bundle_config_product,
  DROP CONSTRAINT IF EXISTS fk_bundle_config_variant;

ALTER TABLE IF EXISTS grosir_warehouse_tolerance
  DROP CONSTRAINT IF EXISTS fk_tolerance_product,
  DROP CONSTRAINT IF EXISTS fk_tolerance_variant;

ALTER TABLE IF EXISTS grosir_variant_allocations
  DROP CONSTRAINT IF EXISTS grosir_variant_allocations_product_id_fkey,
  DROP CONSTRAINT IF EXISTS grosir_variant_allocations_variant_id_fkey;

-- Drop indexes
DROP INDEX IF EXISTS idx_bundle_config_product;
DROP INDEX IF EXISTS idx_tolerance_product;
DROP INDEX IF EXISTS idx_grosir_allocations_product;

-- Drop the tables
DROP TABLE IF EXISTS grosir_bundle_config;
DROP TABLE IF EXISTS grosir_warehouse_tolerance;
DROP TABLE IF EXISTS grosir_variant_allocations;

-- ============================================================================
-- STEP 2: Create new simplified table - Bundle Composition
-- ============================================================================

CREATE TABLE grosir_bundle_composition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  variant_id UUID,
  units_in_bundle INT NOT NULL CHECK (units_in_bundle > 0),
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) DEFAULT NOW(),

  CONSTRAINT fk_bundle_composition_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_bundle_composition_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  CONSTRAINT unique_bundle_composition
    UNIQUE (product_id, variant_id)
);

CREATE INDEX idx_bundle_composition_product ON grosir_bundle_composition(product_id);

COMMENT ON TABLE grosir_bundle_composition IS 'Defines how many units of each variant are in a wholesale bundle. Example: Bundle = 4S + 4M + 4L';
COMMENT ON COLUMN grosir_bundle_composition.units_in_bundle IS 'Number of this variant in one wholesale bundle';

-- ============================================================================
-- STEP 3: Modify warehouse_inventory - Add stock management fields
-- ============================================================================

-- Add new columns for stock management
ALTER TABLE warehouse_inventory
  ADD COLUMN IF NOT EXISTS max_stock_level INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reorder_threshold INT DEFAULT 0;

-- Add check constraints
ALTER TABLE warehouse_inventory
  ADD CONSTRAINT chk_max_stock_positive CHECK (max_stock_level >= 0),
  ADD CONSTRAINT chk_reorder_threshold_positive CHECK (reorder_threshold >= 0),
  ADD CONSTRAINT chk_reorder_less_than_max CHECK (reorder_threshold <= max_stock_level);

COMMENT ON COLUMN warehouse_inventory.max_stock_level IS 'Maximum units warehouse will hold for this variant';
COMMENT ON COLUMN warehouse_inventory.reorder_threshold IS 'When stock falls to this level, order new bundle from factory';

-- ============================================================================
-- STEP 4: Create helper view for inventory status
-- ============================================================================

CREATE OR REPLACE VIEW warehouse_inventory_status AS
SELECT
  wi.id,
  wi.product_id,
  wi.variant_id,
  wi.quantity,
  wi.reserved_quantity,
  wi.quantity - wi.reserved_quantity AS available_quantity,
  wi.max_stock_level,
  wi.reorder_threshold,
  CASE
    WHEN wi.quantity - wi.reserved_quantity <= 0 THEN 'out_of_stock'
    WHEN wi.quantity <= wi.reorder_threshold THEN 'low_stock'
    ELSE 'in_stock'
  END AS stock_status,
  wi.quantity <= wi.reorder_threshold AS needs_reorder
FROM warehouse_inventory wi;

COMMENT ON VIEW warehouse_inventory_status IS 'Real-time view of warehouse inventory with stock status';

-- ============================================================================
-- STEP 5: Create function to calculate bundles needed
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_bundles_for_order(
  p_product_id UUID,
  p_variant_id UUID,
  p_quantity INT
) RETURNS TABLE (
  units_in_bundle INT,
  bundles_needed INT,
  total_units INT,
  excess_units INT
) AS $$
DECLARE
  v_units_in_bundle INT;
BEGIN
  -- Get bundle composition for this variant
  SELECT bc.units_in_bundle INTO v_units_in_bundle
  FROM grosir_bundle_composition bc
  WHERE bc.product_id = p_product_id
    AND (bc.variant_id = p_variant_id OR (bc.variant_id IS NULL AND p_variant_id IS NULL));

  IF v_units_in_bundle IS NULL THEN
    RAISE EXCEPTION 'Bundle composition not configured for product % variant %', p_product_id, p_variant_id;
  END IF;

  RETURN QUERY SELECT
    v_units_in_bundle,
    CEIL(p_quantity::NUMERIC / v_units_in_bundle)::INT,
    (CEIL(p_quantity::NUMERIC / v_units_in_bundle) * v_units_in_bundle)::INT,
    ((CEIL(p_quantity::NUMERIC / v_units_in_bundle) * v_units_in_bundle) - p_quantity)::INT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_bundles_for_order IS 'Calculate how many bundles needed to fulfill an order quantity';
