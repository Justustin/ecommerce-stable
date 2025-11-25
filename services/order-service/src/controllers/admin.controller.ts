import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

export class AdminController {
  // Order Management
  getAllOrders = async (req: Request, res: Response) => {
    try {
      const { status, userId, factoryId, startDate, endDate } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      if (userId) where.user_id = userId;
      if (factoryId) where.factory_id = factoryId;
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) where.created_at.gte = new Date(startDate as string);
        if (endDate) where.created_at.lte = new Date(endDate as string);
      }

      const [total, orders] = await Promise.all([
        prisma.orders.count({ where }),
        prisma.orders.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            users: { select: { id: true, first_name: true, last_name: true, email: true } },
            order_items: true
          }
        })
      ]);

      res.json({
        data: orders,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getOrderDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const order = await prisma.orders.findUnique({
        where: { id },
        include: {
          users: { select: { id: true, first_name: true, last_name: true, email: true, phone_number: true } },
          order_items: {
            include: {
              products: true,
              product_variants: true
            }
          },
          payments: true,
          shipments: true
        }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ data: order });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updateOrderStatus = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, notes } = req.body;

      const order = await prisma.orders.update({
        where: { id },
        data: {
          status,
          updated_at: new Date()
        }
      });

      console.log(`Order ${id} status changed to ${status}. Notes: ${notes || 'None'}`);

      res.json({
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  cancelOrder = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { reason, refund } = req.body;

      const order = await prisma.orders.findUnique({ where: { id } });
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
        return res.status(400).json({ error: `Cannot cancel order with status: ${order.status}` });
      }

      const updated = await prisma.orders.update({
        where: { id },
        data: {
          status: 'cancelled',
          updated_at: new Date()
        }
      });

      // TODO: Trigger refund if requested
      if (refund) {
        console.log(`Refund triggered for order ${id}. Reason: ${reason}`);
      }

      res.json({
        message: 'Order cancelled successfully',
        data: updated,
        cancellation: { reason, refundTriggered: refund || false }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Bulk Operations
  bulkUpdateStatus = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { orderIds, status } = req.body;

      const result = await prisma.orders.updateMany({
        where: { id: { in: orderIds } },
        data: {
          status,
          updated_at: new Date()
        }
      });

      res.json({
        message: 'Orders updated successfully',
        count: result.count
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Analytics
  getOrderAnalytics = async (req: Request, res: Response) => {
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
        totalOrders,
        statusCounts,
        revenueData
      ] = await Promise.all([
        prisma.orders.count({ where: whereClause }),
        prisma.orders.groupBy({
          by: ['status'],
          where: whereClause,
          _count: true
        }),
        prisma.orders.aggregate({
          where: { ...whereClause, status: { in: ['paid', 'processing', 'delivered'] } },
          _sum: { total_amount: true },
          _avg: { total_amount: true }
        })
      ]);

      const statusBreakdown: any = {};
      statusCounts.forEach(item => {
        statusBreakdown[item.status] = item._count;
      });

      res.json({
        data: {
          totalOrders,
          statusBreakdown,
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

  getDailyOrders = async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const orders = await prisma.orders.findMany({
        where: {
          created_at: { gte: startDate }
        },
        select: {
          created_at: true,
          total_amount: true,
          status: true
        }
      });

      // Group by date
      const dailyData: any = {};
      orders.forEach(order => {
        const date = order.created_at.toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { orders: 0, revenue: 0 };
        }
        dailyData[date].orders++;
        dailyData[date].revenue += Number(order.total_amount);
      });

      res.json({
        data: Object.entries(dailyData).map(([date, stats]: [string, any]) => ({
          date,
          ...stats
        })).sort((a, b) => a.date.localeCompare(b.date))
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}