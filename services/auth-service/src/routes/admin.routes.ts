import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

// User Management
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin)
 *     tags: [Admin - Users]
 */
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional(),
  query('isActive').optional().isBoolean(),
  query('search').optional()
], controller.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details (Admin)
 *     tags: [Admin - Users]
 */
router.get('/users/:id', [
  param('id').isUUID().withMessage('Invalid user ID')
], controller.getUserDetails);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user (Admin)
 *     tags: [Admin - Users]
 */
router.put('/users/:id', [
  param('id').isUUID().withMessage('Invalid user ID')
], controller.updateUser);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Toggle user status (Admin)
 *     tags: [Admin - Users]
 */
router.put('/users/:id/status', [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('isActive').isBoolean().withMessage('isActive must be boolean')
], controller.toggleUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role (Admin)
 *     tags: [Admin - Users]
 */
router.put('/users/:id/role', [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('role').notEmpty().withMessage('Role is required')
], controller.updateUserRole);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin)
 *     tags: [Admin - Users]
 */
router.delete('/users/:id', [
  param('id').isUUID().withMessage('Invalid user ID')
], controller.deleteUser);

// OTP Management
/**
 * @swagger
 * /api/admin/otps:
 *   get:
 *     summary: Get OTP records (Admin)
 *     tags: [Admin - OTPs]
 */
router.get('/otps', controller.getOTPRecords);

/**
 * @swagger
 * /api/admin/otps/clear-expired:
 *   post:
 *     summary: Clear expired OTPs (Admin)
 *     tags: [Admin - OTPs]
 */
router.post('/otps/clear-expired', controller.clearExpiredOTPs);

// Analytics
/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get user analytics (Admin)
 *     tags: [Admin - Analytics]
 */
router.get('/analytics', controller.getUserAnalytics);

export default router;
