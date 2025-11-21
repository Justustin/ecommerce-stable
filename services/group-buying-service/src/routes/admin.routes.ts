import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

// Session Management
/**
 * @swagger
 * /api/admin/sessions:
 *   get:
 *     summary: Get all sessions (Admin)
 *     tags: [Admin - Sessions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: factoryId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 */
router.get('/sessions', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional(),
  query('factoryId').optional().isUUID()
], controller.getAllSessions);

/**
 * @swagger
 * /api/admin/sessions/{id}:
 *   get:
 *     summary: Get session details (Admin)
 *     tags: [Admin - Sessions]
 */
router.get('/sessions/:id', [
  param('id').isUUID().withMessage('Invalid session ID')
], controller.getSessionDetails);

/**
 * @swagger
 * /api/admin/sessions/{id}/status:
 *   put:
 *     summary: Update session status (Admin)
 *     tags: [Admin - Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [forming, active, moq_reached, pending_stock, stock_received, success, failed, cancelled]
 *               reason:
 *                 type: string
 */
router.put('/sessions/:id/status', [
  param('id').isUUID().withMessage('Invalid session ID'),
  body('status').isIn(['forming', 'active', 'moq_reached', 'pending_stock', 'stock_received', 'success', 'failed', 'cancelled']).withMessage('Invalid status'),
  body('reason').optional()
], controller.updateSessionStatus);

/**
 * @swagger
 * /api/admin/sessions/{id}/extend:
 *   post:
 *     summary: Extend session end time (Admin)
 *     tags: [Admin - Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newEndTime]
 *             properties:
 *               newEndTime:
 *                 type: string
 *                 format: date-time
 */
router.post('/sessions/:id/extend', [
  param('id').isUUID().withMessage('Invalid session ID'),
  body('newEndTime').isISO8601().withMessage('Invalid date format')
], controller.extendSession);

// Bundle Configuration
/**
 * @swagger
 * /api/admin/bundle-configs:
 *   get:
 *     summary: Get bundle configurations (Admin)
 *     tags: [Admin - Bundle Config]
 */
router.get('/bundle-configs', [
  query('productId').optional().isUUID()
], controller.getBundleConfigs);

/**
 * @swagger
 * /api/admin/bundle-configs:
 *   post:
 *     summary: Create bundle configuration (Admin)
 *     tags: [Admin - Bundle Config]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, unitsPerBundle]
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               variantId:
 *                 type: string
 *                 format: uuid
 *               unitsPerBundle:
 *                 type: integer
 */
router.post('/bundle-configs', [
  body('productId').isUUID().withMessage('Invalid product ID'),
  body('variantId').optional().isUUID().withMessage('Invalid variant ID'),
  body('unitsPerBundle').isInt({ min: 1 }).withMessage('Units per bundle must be at least 1')
], controller.createBundleConfig);

/**
 * @swagger
 * /api/admin/bundle-configs/{id}:
 *   put:
 *     summary: Update bundle configuration (Admin)
 *     tags: [Admin - Bundle Config]
 */
router.put('/bundle-configs/:id', [
  param('id').isUUID().withMessage('Invalid config ID'),
  body('unitsPerBundle').isInt({ min: 1 }).withMessage('Units per bundle must be at least 1')
], controller.updateBundleConfig);

/**
 * @swagger
 * /api/admin/bundle-configs/{id}:
 *   delete:
 *     summary: Delete bundle configuration (Admin)
 *     tags: [Admin - Bundle Config]
 */
router.delete('/bundle-configs/:id', [
  param('id').isUUID().withMessage('Invalid config ID')
], controller.deleteBundleConfig);

// Warehouse Tolerance
/**
 * @swagger
 * /api/admin/warehouse-tolerances:
 *   get:
 *     summary: Get warehouse tolerances (Admin)
 *     tags: [Admin - Warehouse Tolerance]
 */
router.get('/warehouse-tolerances', controller.getWarehouseTolerances);

/**
 * @swagger
 * /api/admin/warehouse-tolerances:
 *   post:
 *     summary: Create warehouse tolerance (Admin)
 *     tags: [Admin - Warehouse Tolerance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [warehouseId, productId, maxExcessUnits]
 *             properties:
 *               warehouseId:
 *                 type: string
 *                 format: uuid
 *               productId:
 *                 type: string
 *                 format: uuid
 *               maxExcessUnits:
 *                 type: integer
 */
router.post('/warehouse-tolerances', [
  body('warehouseId').isUUID().withMessage('Invalid warehouse ID'),
  body('productId').isUUID().withMessage('Invalid product ID'),
  body('maxExcessUnits').isInt({ min: 0 }).withMessage('Max excess units must be non-negative')
], controller.createWarehouseTolerance);

/**
 * @swagger
 * /api/admin/warehouse-tolerances/{id}:
 *   put:
 *     summary: Update warehouse tolerance (Admin)
 *     tags: [Admin - Warehouse Tolerance]
 */
router.put('/warehouse-tolerances/:id', [
  param('id').isUUID().withMessage('Invalid tolerance ID'),
  body('maxExcessUnits').isInt({ min: 0 }).withMessage('Max excess units must be non-negative')
], controller.updateWarehouseTolerance);

/**
 * @swagger
 * /api/admin/warehouse-tolerances/{id}:
 *   delete:
 *     summary: Delete warehouse tolerance (Admin)
 *     tags: [Admin - Warehouse Tolerance]
 */
router.delete('/warehouse-tolerances/:id', [
  param('id').isUUID().withMessage('Invalid tolerance ID')
], controller.deleteWarehouseTolerance);

// Variant Allocations
/**
 * @swagger
 * /api/admin/variant-allocations:
 *   get:
 *     summary: Get variant allocations (Admin)
 *     tags: [Admin - Allocations]
 */
router.get('/variant-allocations', [
  query('sessionId').optional().isUUID()
], controller.getVariantAllocations);

/**
 * @swagger
 * /api/admin/variant-allocations/{id}:
 *   put:
 *     summary: Update variant allocation (Admin)
 *     tags: [Admin - Allocations]
 */
router.put('/variant-allocations/:id', [
  param('id').isUUID().withMessage('Invalid allocation ID'),
  body('maxQuantity').optional().isInt({ min: 0 }),
  body('currentQuantity').optional().isInt({ min: 0 })
], controller.updateVariantAllocation);

// Analytics
/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get session analytics (Admin)
 *     tags: [Admin - Analytics]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 */
router.get('/analytics', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], controller.getSessionAnalytics);

// Product Configuration
/**
 * @swagger
 * /api/admin/products/{productId}/config:
 *   get:
 *     summary: Get complete product configuration (Admin)
 *     tags: [Admin - Configuration]
 */
router.get('/products/:productId/config', [
  param('productId').isUUID().withMessage('Invalid product ID')
], controller.getProductConfig);

export default router;
