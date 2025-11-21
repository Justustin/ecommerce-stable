import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

export class AdminController {
  // Wallet Management
  getAllWallets = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const { userId, minBalance, maxBalance } = req.query;

      const where: any = {};
      if (userId) where.user_id = userId;
      if (minBalance || maxBalance) {
        where.balance = {};
        if (minBalance) where.balance.gte = parseFloat(minBalance as string);
        if (maxBalance) where.balance.lte = parseFloat(maxBalance as string);
      }

      const [total, wallets] = await Promise.all([
        prisma.wallets.count({ where }),
        prisma.wallets.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            users: { select: { id: true, first_name: true, last_name: true, email: true } }
          }
        })
      ]);

      res.json({
        data: wallets,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getWalletDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const wallet = await prisma.wallets.findUnique({
        where: { id },
        include: {
          users: { select: { id: true, first_name: true, last_name: true, email: true, phone_number: true } },
          wallet_transactions: {
            take: 50,
            orderBy: { created_at: 'desc' }
          }
        }
      });

      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      res.json({ data: wallet });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Balance Adjustments
  adjustBalance = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { amount, type, reason } = req.body;

      const wallet = await prisma.wallets.findUnique({ where: { id } });
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      const adjustmentAmount = type === 'credit' ? amount : -amount;
      const newBalance = wallet.balance.toNumber() + adjustmentAmount;

      if (newBalance < 0) {
        return res.status(400).json({ error: 'Insufficient balance for debit' });
      }

      const [updatedWallet, transaction] = await prisma.$transaction([
        prisma.wallets.update({
          where: { id },
          data: {
            balance: newBalance,
            updated_at: new Date()
          }
        }),
        prisma.wallet_transactions.create({
          data: {
            wallet_id: id,
            transaction_type: `admin_${type}`,
            amount: Math.abs(amount),
            balance_before: wallet.balance,
            balance_after: newBalance,
            description: reason || `Admin ${type} adjustment`
          }
        })
      ]);

      res.json({
        message: `Balance ${type}ed successfully`,
        data: { wallet: updatedWallet, transaction }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Transaction Management
  getAllTransactions = async (req: Request, res: Response) => {
    try {
      const { type, userId, startDate, endDate } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (type) where.transaction_type = type;
      if (userId) {
        where.wallets = { user_id: userId };
      }
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) where.created_at.gte = new Date(startDate as string);
        if (endDate) where.created_at.lte = new Date(endDate as string);
      }

      const [total, transactions] = await Promise.all([
        prisma.wallet_transactions.count({ where }),
        prisma.wallet_transactions.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            wallets: {
              include: {
                users: { select: { id: true, first_name: true, last_name: true } }
              }
            }
          }
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

  // Withdrawal Management
  getPendingWithdrawals = async (req: Request, res: Response) => {
    try {
      const withdrawals = await prisma.wallet_transactions.findMany({
        where: {
          transaction_type: 'withdrawal',
          status: 'pending'
        },
        include: {
          wallets: {
            include: {
              users: { select: { id: true, first_name: true, last_name: true, email: true } }
            }
          }
        },
        orderBy: { created_at: 'asc' }
      });

      res.json({ data: withdrawals });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  processWithdrawal = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { action, notes } = req.body;

      const transaction = await prisma.wallet_transactions.findUnique({
        where: { id },
        include: { wallets: true }
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (transaction.transaction_type !== 'withdrawal') {
        return res.status(400).json({ error: 'Transaction is not a withdrawal' });
      }

      const newStatus = action === 'approve' ? 'completed' : 'rejected';

      // If rejecting, refund the balance
      if (action === 'reject' && transaction.wallets) {
        await prisma.wallets.update({
          where: { id: transaction.wallet_id },
          data: {
            balance: { increment: transaction.amount },
            updated_at: new Date()
          }
        });
      }

      const updated = await prisma.wallet_transactions.update({
        where: { id },
        data: {
          status: newStatus,
          updated_at: new Date()
        }
      });

      res.json({
        message: `Withdrawal ${action}d successfully`,
        data: updated
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Analytics
  getWalletAnalytics = async (req: Request, res: Response) => {
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
        totalWallets,
        totalBalance,
        transactionStats,
        typeCounts
      ] = await Promise.all([
        prisma.wallets.count(),
        prisma.wallets.aggregate({
          _sum: { balance: true },
          _avg: { balance: true }
        }),
        prisma.wallet_transactions.aggregate({
          where: whereClause,
          _count: true,
          _sum: { amount: true }
        }),
        prisma.wallet_transactions.groupBy({
          by: ['transaction_type'],
          where: whereClause,
          _count: true,
          _sum: { amount: true }
        })
      ]);

      res.json({
        data: {
          totalWallets,
          balances: {
            total: totalBalance._sum.balance || 0,
            average: totalBalance._avg.balance || 0
          },
          transactions: {
            count: transactionStats._count,
            totalAmount: transactionStats._sum.amount || 0
          },
          byType: typeCounts.reduce((acc: any, item) => {
            acc[item.transaction_type] = {
              count: item._count,
              amount: item._sum.amount || 0
            };
            return acc;
          }, {})
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Freeze/Unfreeze Wallet
  toggleWalletStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { action, reason } = req.body;

      const wallet = await prisma.wallets.findUnique({ where: { id } });
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      const updated = await prisma.wallets.update({
        where: { id },
        data: {
          is_active: action === 'activate',
          updated_at: new Date()
        }
      });

      res.json({
        message: `Wallet ${action}d successfully`,
        data: updated
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
