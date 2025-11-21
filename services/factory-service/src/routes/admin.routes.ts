import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

/**
 * @swagger
 * /api/admin/factories:
 *   post:
 *     summary: Register a new factory (Admin)
 *     tags: [Admin - Factories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ownerId, factoryCode, factoryName, phoneNumber, province, city, district, addressLine]
 *             properties:
 *               ownerId:
 *                 type: string
 *                 format: uuid
 *               factoryCode:
 *                 type: string
 *               factoryName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               province:
 *                 type: string
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               addressLine:
 *                 type: string
 *               description:
 *                 type: string
 *               businessLicenseNumber:
 *                 type: string
 *               taxId:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Factory registered successfully
 *       409:
 *         description: Factory already exists
 */
router.post('/', [
  body('ownerId').isUUID().withMessage('Invalid owner ID'),
  body('factoryCode').notEmpty().withMessage('Factory code is required'),
  body('factoryName').notEmpty().withMessage('Factory name is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('province').notEmpty().withMessage('Province is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('district').notEmpty().withMessage('District is required'),
  body('addressLine').notEmpty().withMessage('Address is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('postalCode').optional(),
  body('description').optional(),
  body('businessLicenseNumber').optional(),
  body('taxId').optional(),
  body('logoUrl').optional().isURL().withMessage('Invalid logo URL')
], controller.registerFactory);

/**
 * @swagger
 * /api/admin/factories/{id}:
 *   put:
 *     summary: Update factory details (Admin)
 *     tags: [Admin - Factories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Factory updated successfully
 *       404:
 *         description: Factory not found
 */
router.put('/:id', [
  param('id').isUUID().withMessage('Invalid factory ID'),
  body('factoryName').optional(),
  body('phoneNumber').optional(),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('province').optional(),
  body('city').optional(),
  body('district').optional(),
  body('postalCode').optional(),
  body('addressLine').optional(),
  body('description').optional(),
  body('businessLicenseNumber').optional(),
  body('taxId').optional(),
  body('logoUrl').optional()
], controller.updateFactory);

/**
 * @swagger
 * /api/admin/factories/{id}:
 *   delete:
 *     summary: Delete factory (Admin)
 *     tags: [Admin - Factories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Factory deleted successfully
 *       400:
 *         description: Cannot delete factory with active sessions
 *       404:
 *         description: Factory not found
 */
router.delete('/:id', [
  param('id').isUUID().withMessage('Invalid factory ID')
], controller.deleteFactory);

/**
 * @swagger
 * /api/admin/factories/{id}/verify:
 *   post:
 *     summary: Verify/approve factory (Admin)
 *     tags: [Admin - Factories]
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
 *             required: [verifiedBy]
 *             properties:
 *               verifiedBy:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Factory verified successfully
 *       404:
 *         description: Factory not found
 */
router.post('/:id/verify', [
  param('id').isUUID().withMessage('Invalid factory ID'),
  body('verifiedBy').isUUID().withMessage('Invalid admin user ID')
], controller.verifyFactory);

/**
 * @swagger
 * /api/admin/factories/{id}/suspend:
 *   post:
 *     summary: Suspend factory operations (Admin)
 *     tags: [Admin - Factories]
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
 *               suspensionDuration:
 *                 type: string
 *                 description: e.g., "7 days", "1 month"
 *     responses:
 *       200:
 *         description: Factory suspended successfully
 *       404:
 *         description: Factory not found
 */
router.post('/:id/suspend', [
  param('id').isUUID().withMessage('Invalid factory ID'),
  body('reason').notEmpty().withMessage('Suspension reason is required'),
  body('suspensionDuration').optional()
], controller.suspendFactory);

/**
 * @swagger
 * /api/admin/factories/{id}/reactivate:
 *   post:
 *     summary: Reactivate suspended factory (Admin)
 *     tags: [Admin - Factories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Factory reactivated successfully
 *       404:
 *         description: Factory not found
 */
router.post('/:id/reactivate', [
  param('id').isUUID().withMessage('Invalid factory ID')
], controller.reactivateFactory);

/**
 * @swagger
 * /api/admin/factories/{id}/metrics:
 *   get:
 *     summary: Get factory performance metrics (Admin)
 *     tags: [Admin - Analytics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
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
 *         description: Metrics retrieved successfully
 */
router.get('/:id/metrics', [
  param('id').isUUID().withMessage('Invalid factory ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], controller.getFactoryMetrics);

/**
 * @swagger
 * /api/admin/factories/{id}/sessions:
 *   get:
 *     summary: Get factory sessions (Admin)
 *     tags: [Admin - Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 */
router.get('/:id/sessions', [
  param('id').isUUID().withMessage('Invalid factory ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit')
], controller.getFactorySessions);

/**
 * @swagger
 * /api/admin/factories/{id}/sessions/{sessionId}/cancel:
 *   post:
 *     summary: Force cancel a session (Admin)
 *     tags: [Admin - Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: sessionId
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
 *               refundParticipants:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Session cancelled successfully
 *       400:
 *         description: Cannot cancel session
 *       404:
 *         description: Session not found
 */
router.post('/:id/sessions/:sessionId/cancel', [
  param('id').isUUID().withMessage('Invalid factory ID'),
  param('sessionId').isUUID().withMessage('Invalid session ID'),
  body('reason').notEmpty().withMessage('Cancellation reason is required'),
  body('refundParticipants').optional().isBoolean()
], controller.forceCancelSession);

/**
 * @swagger
 * /api/admin/factories/{id}/analytics:
 *   get:
 *     summary: Get factory analytics (Admin)
 *     tags: [Admin - Analytics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get('/:id/analytics', [
  param('id').isUUID().withMessage('Invalid factory ID'),
  query('year').optional().isInt({ min: 2020, max: 2100 }).withMessage('Invalid year')
], controller.getFactoryAnalytics);

export default router;
