import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
const router: Router = Router();
const controller = new ProductController();

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProduct'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', controller.createProduct);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: factoryId
 *         schema:
 *           type: string
 *         description: Filter by factory ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, inactive]
 *         description: Filter by product status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', controller.getProducts);

/**
 * @swagger
 * /api/products/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Product slug
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:slug', controller.getProductBySlug);

/**
 * @swagger
 * /api/products/id/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/id/:id', controller.getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Update product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProduct'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.patch('/:id', controller.updateProduct);

/**
 * @swagger
 * /api/products/{id}/publish:
 *   patch:
 *     summary: Publish product (change status from draft to active)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product published successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.patch('/:id/publish', controller.publishProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (soft delete - sets status to inactive)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:id', controller.deleteProduct);

/**
 * @swagger
 * /api/products/{id}/images:
 *   post:
 *     summary: Add images to product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       example: https://example.com/image.jpg
 *                     sortOrder:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Images added successfully
 *       404:
 *         description: Product not found
 */
router.post('/:id/images', controller.addImages);

/**
 * @swagger
 * /api/products/{id}/variants:
 *   post:
 *     summary: Add variant to product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVariant'
 *     responses:
 *       201:
 *         description: Variant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductVariant'
 *       404:
 *         description: Product not found
 */
router.post('/:id/variants', controller.createVariant);
router.get('/variants/:variantId', controller.getVariantById);

// ============= Grosir Config Management =============

/**
 * @swagger
 * /api/products/{id}/grosir-config:
 *   get:
 *     summary: Get grosir configuration for a product
 *     tags: [Grosir Config]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Grosir configuration
 *       404:
 *         description: Product not found
 */
router.get('/:id/grosir-config', controller.getGrosirConfig);

/**
 * @swagger
 * /api/products/{id}/grosir-allocations:
 *   post:
 *     summary: Set grosir variant allocations
 *     description: Define how many of each variant can be ordered (allocation_quantity per variant)
 *     tags: [Grosir Config]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - allocations
 *             properties:
 *               allocations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - allocationQuantity
 *                   properties:
 *                     variantId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                       description: Variant ID (null for base product)
 *                     allocationQuantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Base allocation quantity for this variant
 *           example:
 *             allocations:
 *               - variantId: "s-variant-uuid"
 *                 allocationQuantity: 20
 *               - variantId: "m-variant-uuid"
 *                 allocationQuantity: 50
 *               - variantId: "l-variant-uuid"
 *                 allocationQuantity: 40
 *     responses:
 *       200:
 *         description: Allocations set successfully
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Product not found
 */
router.post('/:id/grosir-allocations', controller.setGrosirAllocations);

/**
 * @swagger
 * /api/products/{id}/warehouse-tolerance:
 *   post:
 *     summary: Set warehouse tolerance configuration
 *     description: Define max excess units warehouse will absorb per variant
 *     tags: [Grosir Config]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tolerances
 *             properties:
 *               tolerances:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - maxExcessUnits
 *                   properties:
 *                     variantId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                       description: Variant ID (null for base product)
 *                     maxExcessUnits:
 *                       type: integer
 *                       minimum: 0
 *                       description: Maximum excess units warehouse will hold
 *                     clearanceRateEstimate:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 1
 *                       default: 0.8
 *                       description: Estimated clearance rate (0-1)
 *           example:
 *             tolerances:
 *               - variantId: "s-variant-uuid"
 *                 maxExcessUnits: 20
 *                 clearanceRateEstimate: 0.8
 *               - variantId: "m-variant-uuid"
 *                 maxExcessUnits: 50
 *                 clearanceRateEstimate: 0.9
 *               - variantId: "l-variant-uuid"
 *                 maxExcessUnits: 40
 *                 clearanceRateEstimate: 0.85
 *     responses:
 *       200:
 *         description: Tolerance set successfully
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Product not found
 */
router.post('/:id/warehouse-tolerance', controller.setWarehouseTolerance);

export default router;