import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

/**
 * @swagger
 * /api/admin/addresses:
 *   get:
 *     summary: Get all addresses (Admin)
 *     tags: [Admin - Addresses]
 */
router.get('/addresses', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('userId').optional().isUUID(),
  query('district').optional(),
  query('isDefault').optional().isBoolean()
], controller.getAllAddresses);

/**
 * @swagger
 * /api/admin/addresses/{id}:
 *   get:
 *     summary: Get address details (Admin)
 *     tags: [Admin - Addresses]
 */
router.get('/addresses/:id', [
  param('id').isUUID().withMessage('Invalid address ID')
], controller.getAddressDetails);

/**
 * @swagger
 * /api/admin/addresses/{id}:
 *   put:
 *     summary: Update address (Admin)
 *     tags: [Admin - Addresses]
 */
router.put('/addresses/:id', [
  param('id').isUUID().withMessage('Invalid address ID')
], controller.updateAddress);

/**
 * @swagger
 * /api/admin/addresses/{id}:
 *   delete:
 *     summary: Delete address (Admin)
 *     tags: [Admin - Addresses]
 */
router.delete('/addresses/:id', [
  param('id').isUUID().withMessage('Invalid address ID')
], controller.deleteAddress);

/**
 * @swagger
 * /api/admin/addresses/bulk-delete:
 *   post:
 *     summary: Bulk delete addresses (Admin)
 *     tags: [Admin - Addresses]
 */
router.post('/addresses/bulk-delete', [
  body('ids').isArray().withMessage('IDs must be an array')
], controller.bulkDeleteAddresses);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get address analytics (Admin)
 *     tags: [Admin - Analytics]
 */
router.get('/analytics', controller.getAddressAnalytics);

export default router;
