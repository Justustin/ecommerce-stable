import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

// Notification Management
/**
 * @swagger
 * /api/admin/notifications:
 *   get:
 *     summary: Get all notifications (Admin)
 *     tags: [Admin - Notifications]
 */
router.get('/notifications', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional(),
  query('channel').optional(),
  query('isRead').optional().isBoolean(),
  query('userId').optional().isUUID()
], controller.getAllNotifications);

/**
 * @swagger
 * /api/admin/notifications/broadcast:
 *   post:
 *     summary: Send broadcast notification (Admin)
 *     tags: [Admin - Notifications]
 */
router.post('/notifications/broadcast', [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').optional(),
  body('channel').optional(),
  body('userIds').optional().isArray()
], controller.sendBroadcast);

/**
 * @swagger
 * /api/admin/notifications/{id}:
 *   delete:
 *     summary: Delete notification (Admin)
 *     tags: [Admin - Notifications]
 */
router.delete('/notifications/:id', [
  param('id').isUUID().withMessage('Invalid notification ID')
], controller.deleteNotification);

/**
 * @swagger
 * /api/admin/notifications/bulk-delete:
 *   post:
 *     summary: Bulk delete notifications (Admin)
 *     tags: [Admin - Notifications]
 */
router.post('/notifications/bulk-delete', controller.bulkDeleteNotifications);

/**
 * @swagger
 * /api/admin/notifications/clear-old:
 *   post:
 *     summary: Clear old read notifications (Admin)
 *     tags: [Admin - Notifications]
 */
router.post('/notifications/clear-old', [
  body('daysOld').optional().isInt({ min: 1 })
], controller.clearOldNotifications);

// Analytics
/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get notification analytics (Admin)
 *     tags: [Admin - Analytics]
 */
router.get('/analytics', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], controller.getNotificationAnalytics);

export default router;
