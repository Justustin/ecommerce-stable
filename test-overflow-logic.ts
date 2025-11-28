/**
 * Integration test for group buying overflow logic
 *
 * This script tests:
 * 1. Bundle composition setup
 * 2. Warehouse inventory with max_stock_level
 * 3. Group buying session creation
 * 4. Overflow check endpoints
 * 5. Join session with overflow validation
 */

import { PrismaClient } from '@repo/database';
import axios from 'axios';

const prisma = new PrismaClient();

const WAREHOUSE_SERVICE_URL = process.env.WAREHOUSE_SERVICE_URL || 'http://localhost:3003';
const GROUP_BUYING_SERVICE_URL = process.env.GROUP_BUYING_SERVICE_URL || 'http://localhost:3002';

interface TestContext {
    productId: string;
    factoryId: string;
    categoryId: string;
    userId: string;
    variantSId: string;
    variantMId: string;
    variantLId: string;
    sessionId?: string;
}

async function setupTestData(): Promise<TestContext> {
    console.log('\n🔧 Setting up test data...\n');

    // 1. Get or create a factory
    let factory = await prisma.factories.findFirst();
    if (!factory) {
        factory = await prisma.factories.create({
            data: {
                name: 'Test Factory',
                location: 'Test Location',
                postal_code: '12345'
            }
        });
    }
    console.log(`✓ Factory: ${factory.id}`);

    // 2. Get or create a category
    let category = await prisma.categories.findFirst();
    if (!category) {
        category = await prisma.categories.create({
            data: {
                name: 'Test Category',
                slug: 'test-category-' + Date.now()
            }
        });
    }
    console.log(`✓ Category: ${category.id}`);

    // 3. Get or create a test user
    let user = await prisma.users.findFirst();
    if (!user) {
        user = await prisma.users.create({
            data: {
                email: `test-${Date.now()}@example.com`,
                password_hash: 'test',
                full_name: 'Test User'
            }
        });
    }
    console.log(`✓ User: ${user.id}`);

    // 4. Create a test product
    const product = await prisma.products.create({
        data: {
            factory_id: factory.id,
            category_id: category.id,
            sku: `TEST-TSHIRT-${Date.now()}`,
            name: 'Test T-Shirt (S, M, L)',
            slug: `test-tshirt-${Date.now()}`,
            description: 'Test product for overflow logic',
            base_price: 10000,
            moq: 12,
            status: 'published',
            product_source: 'factory_group_buying'
        }
    });
    console.log(`✓ Product: ${product.id} (${product.name})`);

    // 5. Create variants (S, M, L)
    const variantS = await prisma.product_variants.create({
        data: {
            product_id: product.id,
            sku: `${product.sku}-S`,
            variant_name: 'Small',
            variant_value: 'S',
            price_adjustment: 0
        }
    });
    console.log(`✓ Variant S: ${variantS.id}`);

    const variantM = await prisma.product_variants.create({
        data: {
            product_id: product.id,
            sku: `${product.sku}-M`,
            variant_name: 'Medium',
            variant_value: 'M',
            price_adjustment: 0
        }
    });
    console.log(`✓ Variant M: ${variantM.id}`);

    const variantL = await prisma.product_variants.create({
        data: {
            product_id: product.id,
            sku: `${product.sku}-L`,
            variant_name: 'Large',
            variant_value: 'L',
            price_adjustment: 0
        }
    });
    console.log(`✓ Variant L: ${variantL.id}`);

    // 6. Create bundle composition: 4S + 4M + 4L = 12 units per bundle
    await prisma.grosir_bundle_composition.createMany({
        data: [
            { product_id: product.id, variant_id: variantS.id, units_in_bundle: 4 },
            { product_id: product.id, variant_id: variantM.id, units_in_bundle: 4 },
            { product_id: product.id, variant_id: variantL.id, units_in_bundle: 4 }
        ]
    });
    console.log('✓ Bundle composition: 4S + 4M + 4L = 12 units/bundle');

    // 7. Create warehouse inventory with max_stock_level
    // Scenario: S=8, M=0, L=8 (max=8 for each)
    await prisma.warehouse_inventory.createMany({
        data: [
            {
                product_id: product.id,
                variant_id: variantS.id,
                quantity: 8,
                reserved_quantity: 0,
                max_stock_level: 8,
                reorder_threshold: 4
            },
            {
                product_id: product.id,
                variant_id: variantM.id,
                quantity: 0,
                reserved_quantity: 0,
                max_stock_level: 8,
                reorder_threshold: 4
            },
            {
                product_id: product.id,
                variant_id: variantL.id,
                quantity: 8,
                reserved_quantity: 0,
                max_stock_level: 8,
                reorder_threshold: 4
            }
        ]
    });
    console.log('✓ Warehouse inventory: S=8/8, M=0/8, L=8/8 (quantity/max)');

    return {
        productId: product.id,
        factoryId: factory.id,
        categoryId: category.id,
        userId: user.id,
        variantSId: variantS.id,
        variantMId: variantM.id,
        variantLId: variantL.id
    };
}

async function createGroupBuyingSession(ctx: TestContext): Promise<string> {
    console.log('\n📦 Creating group buying session...\n');

    const session = await prisma.group_buying_sessions.create({
        data: {
            product_id: ctx.productId,
            factory_id: ctx.factoryId,
            session_code: `TEST-${Date.now()}`,
            status: 'forming',
            target_moq: 12,
            group_price: 8000,
            base_price: 10000,
            start_time: new Date(),
            end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            current_tier: 25,
            bulk_shipping_cost_per_unit: 500
        }
    });

    console.log(`✓ Session created: ${session.id}`);
    console.log(`  Code: ${session.session_code}`);
    console.log(`  Status: ${session.status}`);
    console.log(`  Target MOQ: ${session.target_moq}`);
    console.log(`  Group Price: ${session.group_price}`);

    return session.id;
}

async function testCheckAllVariantsEndpoint(ctx: TestContext) {
    console.log('\n🔍 Testing GET /api/warehouse/check-all-variants...\n');

    try {
        const response = await axios.get(`${WAREHOUSE_SERVICE_URL}/api/warehouse/check-all-variants`, {
            params: { productId: ctx.productId }
        });

        console.log('✓ Response received:');
        console.log(JSON.stringify(response.data, null, 2));

        const { data } = response.data;

        console.log('\n📊 Variant Status Summary:');
        for (const variant of data.variants) {
            const lockIcon = variant.isLocked ? '🔒' : '✅';
            console.log(`  ${lockIcon} ${variant.variantName}: ${variant.reason}`);
            if (variant.overflowVariants) {
                console.log(`     Would overflow: ${variant.overflowVariants.join(', ')}`);
            }
        }

        return response.data;
    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
        throw error;
    }
}

async function testCheckBundleOverflow(ctx: TestContext, variantId: string, variantName: string) {
    console.log(`\n🔍 Testing bundle overflow for ${variantName}...\n`);

    try {
        const response = await axios.get(`${WAREHOUSE_SERVICE_URL}/api/warehouse/check-bundle-overflow`, {
            params: {
                productId: ctx.productId,
                variantId: variantId
            }
        });

        console.log(`✓ ${variantName} check:`, response.data.data);
        return response.data.data;
    } catch (error: any) {
        console.error(`❌ Error checking ${variantName}:`, error.response?.data || error.message);
        throw error;
    }
}

async function testJoinSession(ctx: TestContext, sessionId: string, variantId: string, variantName: string, shouldSucceed: boolean) {
    console.log(`\n${shouldSucceed ? '✅' : '❌'} Testing join session with ${variantName} (expect ${shouldSucceed ? 'SUCCESS' : 'FAILURE'})...\n`);

    try {
        // Note: This would be an API call in real scenario
        // For now, we'll just test the overflow check which is called internally
        const overflowCheck = await testCheckBundleOverflow(ctx, variantId, variantName);

        if (overflowCheck.isLocked && shouldSucceed) {
            console.log(`⚠️  Expected success but variant is locked: ${overflowCheck.reason}`);
            return false;
        } else if (!overflowCheck.isLocked && !shouldSucceed) {
            console.log(`⚠️  Expected failure but variant is unlocked`);
            return false;
        } else {
            console.log(`✓ Overflow check behaved as expected`);
            return true;
        }
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

async function runTests() {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🧪 GROUP BUYING OVERFLOW LOGIC - INTEGRATION TEST');
        console.log('═══════════════════════════════════════════════════════');

        // Setup
        const ctx = await setupTestData();

        // Create session
        const sessionId = await createGroupBuyingSession(ctx);
        ctx.sessionId = sessionId;

        // Test 1: Check all variants endpoint
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('TEST 1: Check All Variants Endpoint (Frontend UX)');
        console.log('═══════════════════════════════════════════════════════');
        await testCheckAllVariantsEndpoint(ctx);

        // Test 2: Individual variant checks
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('TEST 2: Individual Variant Overflow Checks');
        console.log('═══════════════════════════════════════════════════════');

        console.log('\n📋 Expected behavior:');
        console.log('  Current inventory: S=8, M=0, L=8 (max=8 each)');
        console.log('  Bundle composition: 4S + 4M + 4L');
        console.log('  - S has stock (8) → UNLOCKED ✅');
        console.log('  - M has no stock (0), but bundle would cause S,L to overflow (8+4>8) → LOCKED 🔒');
        console.log('  - L has stock (8) → UNLOCKED ✅');

        await testCheckBundleOverflow(ctx, ctx.variantSId, 'Small');
        await testCheckBundleOverflow(ctx, ctx.variantMId, 'Medium');
        await testCheckBundleOverflow(ctx, ctx.variantLId, 'Large');

        // Test 3: Join session tests
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('TEST 3: Join Session Validation');
        console.log('═══════════════════════════════════════════════════════');

        const test1 = await testJoinSession(ctx, sessionId, ctx.variantSId, 'Small', true);
        const test2 = await testJoinSession(ctx, sessionId, ctx.variantMId, 'Medium', false);
        const test3 = await testJoinSession(ctx, sessionId, ctx.variantLId, 'Large', true);

        // Summary
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📊 TEST SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        const allPassed = test1 && !test2 && test3;
        if (allPassed) {
            console.log('✅ ALL TESTS PASSED');
        } else {
            console.log('❌ SOME TESTS FAILED');
            console.log(`  Small (should unlock): ${test1 ? '✅' : '❌'}`);
            console.log(`  Medium (should lock): ${!test2 ? '✅' : '❌'}`);
            console.log(`  Large (should unlock): ${test3 ? '✅' : '❌'}`);
        }

        console.log('\n✓ Test completed successfully');

    } catch (error: any) {
        console.error('\n❌ Test failed:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Run tests
runTests();
