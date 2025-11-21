import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

// Order Management
router.get('/orders', [
  query('status').optional(),
  query('userId').optional().isUUID(),
  query('factoryId').optional().isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], controller.getAllOrders);

router.get('/orders/:id', [
  param('id').isUUID().withMessage('Invalid order ID')
], controller.getOrderDetails);

router.put('/orders/:id/status', [
  param('id').isUUID().withMessage('Invalid order ID'),
  body('status').isIn(['pending_payment', 'paid', 'processing', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded', 'failed']).withMessage('Invalid status'),
  body('notes').optional()
], controller.updateOrderStatus);

router.post('/orders/:id/cancel', [
  param('id').isUUID().withMessage('Invalid order ID'),
  body('reason').notEmpty().withMessage('Cancellation reason is required'),
  body('refund').optional().isBoolean()
], controller.cancelOrder);

// Bulk Operations
router.post('/orders/bulk/status', [
  body('orderIds').isArray({ min: 1 }).withMessage('Order IDs array is required'),
  body('status').isIn(['pending_payment', 'paid', 'processing', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded', 'failed']).withMessage('Invalid status')
], controller.bulkUpdateStatus);

// Analytics
router.get('/analytics', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], controller.getOrderAnalytics);

router.get('/analytics/daily', [
  query('days').optional().isInt({ min: 1, max: 365 })
], controller.getDailyOrders);

export default router;
