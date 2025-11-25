import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

export class AdminController {
  // Payment Management
  getAllPayments = async (req: Request, res: Response) => {
    try {
      const { status, userId, paymentMethod, startDate, endDate } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.payment_status = status;
      if (userId) where.user_id = userId;
      if (paymentMethod) where.payment_method = paymentMethod;
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) where.created_at.gte = new Date(startDate as string);
        if (endDate) where.created_at.lte = new Date(endDate as string);
      }

      const [total, payments] = await Promise.all([
        prisma.payments.count({ where }),
        prisma.payments.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            orders: { select: { id: true, order_number: true, status: true } },
            users: { select: { id: true, first_name: true, last_name: true, email: true } }
          }
        })
      ]);

      res.json({
        data: payments,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getPaymentDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const payment = await prisma.payments.findUnique({
        where: { id },
        include: {
          orders: true,
          users: { select: { id: true, first_name: true, last_name: true, email: true, phone_number: true } },
          refunds: true
        }
      });

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json({ data: payment });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Refund Management
  getAllRefunds = async (req: Request, res: Response) => {
    try {
      const { status, userId } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      if (userId) where.user_id = userId;

      const [total, refunds] = await Promise.all([
        prisma.refunds.count({ where }),
        prisma.refunds.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            payments: { select: { id: true, payment_code: true, total_amount: true } }
          }
        })
      ]);

      res.json({
        data: refunds,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  processRefund = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { action, notes } = req.body;

      const refund = await prisma.refunds.findUnique({ where: { id } });
      if (!refund) {
        return res.status(404).json({ error: 'Refund not found' });
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      const updated = await prisma.refunds.update({
        where: { id },
        data: {
          refund_status: newStatus as any, // Cast to enum type if needed
          updated_at: new Date()
        }
      });

      // If approved, update payment status
      if (action === 'approve' && refund.payment_id) {
        await prisma.payments.update({
          where: { id: refund.payment_id },
          data: {
            payment_status: 'refunded',
            refunded_at: new Date()
          }
        });
      }

      res.json({
        message: `Refund ${action}d successfully`,
        data: updated
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Escrow Management
  getEscrowPayments = async (req: Request, res: Response) => {
    try {
      const payments = await prisma.payments.findMany({
        where: {
          is_in_escrow: true,
          payment_status: 'paid'
        },
        include: {
          orders: { select: { id: true, order_number: true } },
          users: { select: { id: true, first_name: true, last_name: true } }
        },
        orderBy: { created_at: 'desc' }
      });

      res.json({ data: payments });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  releaseEscrow = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const payment = await prisma.payments.findUnique({ where: { id } });
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (!payment.is_in_escrow) {
        return res.status(400).json({ error: 'Payment is not in escrow' });
      }

      const updated = await prisma.payments.update({
        where: { id },
        data: {
          is_in_escrow: false,
          escrow_released_at: new Date(),
          updated_at: new Date()
        }
      });

      res.json({
        message: 'Escrow released successfully',
        data: updated
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Analytics
  getPaymentAnalytics = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) dateFilter.lte = new Date(endDate as string);

      const whereClause: any = {};
      if (Object.keys(dateFilter).length > 0) {
        whereClause.created_at = dateFilter;
      }

      const [
        totalPayments,
        statusCounts,
        methodCounts,
        revenueData
      ] = await Promise.all([
        prisma.payments.count({ where: whereClause }),
        prisma.payments.groupBy({
          by: ['payment_status'],
          where: whereClause,
          _count: true
        }),
        prisma.payments.groupBy({
          by: ['payment_method'],
          where: whereClause,
          _count: true
        }),
        prisma.payments.aggregate({
          where: { ...whereClause, payment_status: 'paid' },
          _sum: { total_amount: true },
          _avg: { total_amount: true }
        })
      ]);

      res.json({
        data: {
          totalPayments,
          byStatus: statusCounts.reduce((acc: any, item) => {
            acc[item.payment_status] = item._count;
            return acc;
          }, {}),
          byMethod: methodCounts.reduce((acc: any, item) => {
            acc[item.payment_method] = item._count;
            return acc;
          }, {}),
          revenue: {
            total: revenueData._sum.total_amount || 0,
            average: revenueData._avg.total_amount || 0
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Transaction Ledger
  getTransactionLedger = async (req: Request, res: Response) => {
    try {
      const { type, startDate, endDate } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (type) where.transaction_type = type;
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) where.created_at.gte = new Date(startDate as string);
        if (endDate) where.created_at.lte = new Date(endDate as string);
      }

      const [total, transactions] = await Promise.all([
        prisma.transaction_ledger.count({ where }),
        prisma.transaction_ledger.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' }
        })
      ]);

      res.json({
        data: transactions,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}