-- ============================================================================
-- Group Buying Overflow Logic - Test Data Setup
-- ============================================================================
-- This script creates a complete test scenario for testing overflow logic
-- Run with: psql $DATABASE_URL -f setup-test-data.sql
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🔧 Setting up test data for Group Buying Overflow Logic'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- Get or create factory
DO $$
DECLARE
    v_factory_id uuid;
    v_category_id uuid;
    v_user_id uuid;
    v_product_id uuid;
    v_variant_s_id uuid;
    v_variant_m_id uuid;
    v_variant_l_id uuid;
    v_session_id uuid;
    v_timestamp text;
BEGIN
    v_timestamp := extract(epoch from now())::text;

    -- 1. Get or create factory
    SELECT id INTO v_factory_id FROM factories LIMIT 1;
    IF v_factory_id IS NULL THEN
        INSERT INTO factories (name, location, postal_code)
        VALUES ('Test Factory', 'Jakarta', '12345')
        RETURNING id INTO v_factory_id;
        RAISE NOTICE '✓ Created factory: %', v_factory_id;
    ELSE
        RAISE NOTICE '✓ Using existing factory: %', v_factory_id;
    END IF;

    -- 2. Get or create category
    SELECT id INTO v_category_id FROM categories LIMIT 1;
    IF v_category_id IS NULL THEN
        INSERT INTO categories (name, slug)
        VALUES ('Test Category', 'test-category-' || v_timestamp)
        RETURNING id INTO v_category_id;
        RAISE NOTICE '✓ Created category: %', v_category_id;
    ELSE
        RAISE NOTICE '✓ Using existing category: %', v_category_id;
    END IF;

    -- 3. Get or create user
    SELECT id INTO v_user_id FROM users LIMIT 1;
    IF v_user_id IS NULL THEN
        INSERT INTO users (email, password_hash, full_name)
        VALUES ('test-' || v_timestamp || '@example.com', 'test', 'Test User')
        RETURNING id INTO v_user_id;
        RAISE NOTICE '✓ Created user: %', v_user_id;
    ELSE
        RAISE NOTICE '✓ Using existing user: %', v_user_id;
    END IF;

    -- 4. Create product
    INSERT INTO products (
        factory_id, category_id, sku, name, slug, description,
        base_price, moq, status, product_source
    ) VALUES (
        v_factory_id,
        v_category_id,
        'TEST-TSHIRT-' || v_timestamp,
        'Test T-Shirt (S, M, L) - Overflow Logic Test',
        'test-tshirt-' || v_timestamp,
        'Test product for overflow logic validation',
        10000,
        12,
        'published',
        'factory_group_buying'
    )
    RETURNING id INTO v_product_id;
    RAISE NOTICE '✓ Created product: %', v_product_id;

    -- 5. Create variants
    INSERT INTO product_variants (product_id, sku, variant_name, variant_value, price_adjustment)
    VALUES (v_product_id, 'TEST-TSHIRT-' || v_timestamp || '-S', 'Small', 'S', 0)
    RETURNING id INTO v_variant_s_id;
    RAISE NOTICE '✓ Created variant Small: %', v_variant_s_id;

    INSERT INTO product_variants (product_id, sku, variant_name, variant_value, price_adjustment)
    VALUES (v_product_id, 'TEST-TSHIRT-' || v_timestamp || '-M', 'Medium', 'M', 0)
    RETURNING id INTO v_variant_m_id;
    RAISE NOTICE '✓ Created variant Medium: %', v_variant_m_id;

    INSERT INTO product_variants (product_id, sku, variant_name, variant_value, price_adjustment)
    VALUES (v_product_id, 'TEST-TSHIRT-' || v_timestamp || '-L', 'Large', 'L', 0)
    RETURNING id INTO v_variant_l_id;
    RAISE NOTICE '✓ Created variant Large: %', v_variant_l_id;

    -- 6. Create bundle composition: 4S + 4M + 4L = 12 units
    INSERT INTO grosir_bundle_composition (product_id, variant_id, units_in_bundle)
    VALUES
        (v_product_id, v_variant_s_id, 4),
        (v_product_id, v_variant_m_id, 4),
        (v_product_id, v_variant_l_id, 4);
    RAISE NOTICE '✓ Created bundle composition: 4S + 4M + 4L = 12 units/bundle';

    -- 7. Create warehouse inventory
    -- Scenario: S=8, M=0, L=8 (max=8 for all)
    -- This means M is LOCKED (ordering bundle would overflow S and L)
    INSERT INTO warehouse_inventory (
        product_id, variant_id, quantity, reserved_quantity,
        max_stock_level, reorder_threshold
    ) VALUES
        (v_product_id, v_variant_s_id, 8, 0, 8, 4),
        (v_product_id, v_variant_m_id, 0, 0, 8, 4),
        (v_product_id, v_variant_l_id, 8, 0, 8, 4);
    RAISE NOTICE '✓ Created warehouse inventory:';
    RAISE NOTICE '    Small:  8/8 (quantity/max) → UNLOCKED ✅';
    RAISE NOTICE '    Medium: 0/8 (quantity/max) → LOCKED 🔒 (bundle would overflow S,L)';
    RAISE NOTICE '    Large:  8/8 (quantity/max) → UNLOCKED ✅';

    -- 8. Create group buying session
    INSERT INTO group_buying_sessions (
        product_id, factory_id, session_code, status,
        target_moq, group_price, base_price,
        start_time, end_time, current_tier, bulk_shipping_cost_per_unit
    ) VALUES (
        v_product_id,
        v_factory_id,
        'TEST-' || v_timestamp,
        'forming',
        12,
        8000,
        10000,
        now(),
        now() + interval '7 days',
        25,
        500
    )
    RETURNING id INTO v_session_id;
    RAISE NOTICE '✓ Created group buying session: %', v_session_id;

    -- Output IDs for testing
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📋 SAVE THESE IDs FOR TESTING:';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'product_id:    %', v_product_id;
    RAISE NOTICE 'variant_s_id:  %', v_variant_s_id;
    RAISE NOTICE 'variant_m_id:  %', v_variant_m_id;
    RAISE NOTICE 'variant_l_id:  %', v_variant_l_id;
    RAISE NOTICE 'session_id:    %', v_session_id;
    RAISE NOTICE 'user_id:       %', v_user_id;
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Start services: pnpm dev';
    RAISE NOTICE '   2. Follow TEST_OVERFLOW_LOGIC.md for testing instructions';
    RAISE NOTICE '';

END $$;
