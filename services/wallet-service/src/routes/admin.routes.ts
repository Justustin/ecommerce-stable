import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const controller = new AdminController();

// Wallet Management
/**
 * @swagger
 * /api/admin/wallets:
 *   get:
 *     summary: Get all wallets (Admin)
 *     tags: [Admin - Wallets]
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
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: minBalance
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxBalance
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Wallets retrieved successfully
 */
router.get('/wallets', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('userId').optional().isUUID(),
  query('minBalance').optional().isFloat(),
  query('maxBalance').optional().isFloat()
], controller.getAllWallets);

/**
 * @swagger
 * /api/admin/wallets/{id}:
 *   get:
 *     summary: Get wallet details (Admin)
 *     tags: [Admin - Wallets]
 */
router.get('/wallets/:id', [
  param('id').isUUID().withMessage('Invalid wallet ID')
], controller.getWalletDetails);

/**
 * @swagger
 * /api/admin/wallets/{id}/adjust:
 *   post:
 *     summary: Adjust wallet balance (Admin)
 *     tags: [Admin - Wallets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type]
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [credit, debit]
 *               reason:
 *                 type: string
 */
router.post('/wallets/:id/adjust', [
  param('id').isUUID().withMessage('Invalid wallet ID'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be positive'),
  body('type').isIn(['credit', 'debit']).withMessage('Invalid type'),
  body('reason').optional()
], controller.adjustBalance);

/**
 * @swagger
 * /api/admin/wallets/{id}/status:
 *   put:
 *     summary: Freeze/Unfreeze wallet (Admin)
 *     tags: [Admin - Wallets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [activate, deactivate]
 *               reason:
 *                 type: string
 */
router.put('/wallets/:id/status', [
  param('id').isUUID().withMessage('Invalid wallet ID'),
  body('action').isIn(['activate', 'deactivate']).withMessage('Invalid action'),
  body('reason').optional()
], controller.toggleWalletStatus);

// Transaction Management
/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: Get all transactions (Admin)
 *     tags: [Admin - Transactions]
 */
router.get('/transactions', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional(),
  query('userId').optional().isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], controller.getAllTransactions);

// Withdrawal Management
/**
 * @swagger
 * /api/admin/withdrawals/pending:
 *   get:
 *     summary: Get pending withdrawals (Admin)
 *     tags: [Admin - Withdrawals]
 */
router.get('/withdrawals/pending', controller.getPendingWithdrawals);

/**
 * @swagger
 * /api/admin/withdrawals/{id}/process:
 *   post:
 *     summary: Process withdrawal (approve/reject) (Admin)
 *     tags: [Admin - Withdrawals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *               notes:
 *                 type: string
 */
router.post('/withdrawals/:id/process', [
  param('id').isUUID().withMessage('Invalid transaction ID'),
  body('action').isIn(['approve', 'reject']).withMessage('Invalid action'),
  body('notes').optional()
], controller.processWithdrawal);

// Analytics
/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get wallet analytics (Admin)
 *     tags: [Admin - Analytics]
 */
router.get('/analytics', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], controller.getWalletAnalytics);

export default router;
