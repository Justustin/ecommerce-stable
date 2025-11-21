import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

// Order Management
/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin)
 *     tags: [Admin - Orders]
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
 *           enum: [pending_payment, paid, processing, ready_for_pickup, picked_up, in_transit, delivered, cancelled, refunded, failed]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: factoryId
 *         schema:
 *           type: string
 *           format: uuid
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
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get('/orders', [
  query('status').optional(),
  query('userId').optional().isUUID(),
  query('factoryId').optional().isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], controller.getAllOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get order details (Admin)
 *     tags: [Admin - Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order details retrieved
 *       404:
 *         description: Order not found
 */
router.get('/orders/:id', [
  param('id').isUUID().withMessage('Invalid order ID')
], controller.getOrderDetails);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin)
 *     tags: [Admin - Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 enum: [pending_payment, paid, processing, ready_for_pickup, picked_up, in_transit, delivered, cancelled, refunded, failed]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put('/orders/:id/status', [
  param('id').isUUID().withMessage('Invalid order ID'),
  body('status').isIn(['pending_payment', 'paid', 'processing', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded', 'failed']).withMessage('Invalid status'),
  body('notes').optional()
], controller.updateOrderStatus);

/**
 * @swagger
 * /api/admin/orders/{id}/cancel:
 *   post:
 *     summary: Cancel order (Admin)
 *     tags: [Admin - Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *               refund:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.post('/orders/:id/cancel', [
  param('id').isUUID().withMessage('Invalid order ID'),
  body('reason').notEmpty().withMessage('Cancellation reason is required'),
  body('refund').optional().isBoolean()
], controller.cancelOrder);

// Bulk Operations
/**
 * @swagger
 * /api/admin/orders/bulk/status:
 *   post:
 *     summary: Bulk update order status (Admin)
 *     tags: [Admin - Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderIds, status]
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               status:
 *                 type: string
 *                 enum: [pending_payment, paid, processing, ready_for_pickup, picked_up, in_transit, delivered, cancelled, refunded, failed]
 *     responses:
 *       200:
 *         description: Orders updated
 */
router.post('/orders/bulk/status', [
  body('orderIds').isArray({ min: 1 }).withMessage('Order IDs array is required'),
  body('status').isIn(['pending_payment', 'paid', 'processing', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded', 'failed']).withMessage('Invalid status')
], controller.bulkUpdateStatus);

// Analytics
/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get order analytics (Admin)
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
 *     responses:
 *       200:
 *         description: Analytics retrieved
 */
router.get('/analytics', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], controller.getOrderAnalytics);

/**
 * @swagger
 * /api/admin/analytics/daily:
 *   get:
 *     summary: Get daily order summary (Admin)
 *     tags: [Admin - Analytics]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Daily summary retrieved
 */
router.get('/analytics/daily', [
  query('days').optional().isInt({ min: 1, max: 365 })
], controller.getDailyOrders);

export default router;
