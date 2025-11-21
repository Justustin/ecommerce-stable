import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

// Inventory Management
router.get('/inventory', [
  query('warehouseId').optional().isUUID(),
  query('productId').optional().isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], controller.getInventory);

router.post('/inventory/:id/adjust', [
  param('id').isUUID().withMessage('Invalid inventory ID'),
  body('adjustment').isInt().withMessage('Adjustment must be an integer'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('adjustedBy').isUUID().withMessage('Invalid admin user ID')
], controller.adjustStock);

router.post('/inventory/:id/reserve', [
  param('id').isUUID().withMessage('Invalid inventory ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('orderId').optional().isUUID()
], controller.reserveStock);

router.post('/inventory/:id/release', [
  param('id').isUUID().withMessage('Invalid inventory ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be positive')
], controller.releaseReservation);

// Purchase Orders
router.get('/purchase-orders', [
  query('status').optional(),
  query('warehouseId').optional().isUUID(),
  query('factoryId').optional().isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], controller.getPurchaseOrders);

router.put('/purchase-orders/:id/status', [
  param('id').isUUID().withMessage('Invalid PO ID'),
  body('status').isIn(['pending', 'approved', 'shipped', 'received', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional()
], controller.updatePurchaseOrderStatus);

// Audit & Reports
router.get('/audit', [
  query('warehouseId').optional().isUUID()
], controller.getStockAudit);

router.get('/low-stock', [
  query('threshold').optional().isInt({ min: 0 })
], controller.getLowStockItems);

export default router;
