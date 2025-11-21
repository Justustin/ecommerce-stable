import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

/**
 * @swagger
 * /api/admin/status:
 *   get:
 *     summary: Get WhatsApp connection status (Admin)
 *     tags: [Admin - WhatsApp]
 */
router.get('/status', controller.getStatus);

/**
 * @swagger
 * /api/admin/restart:
 *   post:
 *     summary: Restart WhatsApp connection (Admin)
 *     tags: [Admin - WhatsApp]
 */
router.post('/restart', controller.restartConnection);

/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     summary: Health check (Admin)
 *     tags: [Admin - WhatsApp]
 */
router.get('/health', controller.healthCheck);

export default router;
