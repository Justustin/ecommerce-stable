import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

export class AdminController {
  // Get all notifications
  getAllNotifications = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;
      const { type, channel, isRead, userId } = req.query;

      const where: any = {};
      if (type) where.type = type;
      if (channel) where.channel = channel;
      if (isRead !== undefined) where.is_read = isRead === 'true';
      if (userId) where.user_id = userId;

      const [total, notifications] = await Promise.all([
        prisma.notifications.count({ where }),
        prisma.notifications.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            users: { select: { id: true, first_name: true, last_name: true } }
          }
        })
      ]);

      res.json({
        data: notifications,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Send broadcast notification
  sendBroadcast = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, message, type, channel, userIds } = req.body;

      // Get target users
      let targetUsers;
      if (userIds && userIds.length > 0) {
        targetUsers = await prisma.users.findMany({
          where: { id: { in: userIds } },
          select: { id: true }
        });
      } else {
        targetUsers = await prisma.users.findMany({
          select: { id: true }
        });
      }

      // Create notifications for all users
      const notifications = await prisma.notifications.createMany({
        data: targetUsers.map(user => ({
          user_id: user.id,
          title,
          message,
          type: type || 'broadcast',
          channel: channel || 'push'
        }))
      });

      res.json({
        message: `Broadcast sent to ${notifications.count} users`,
        data: { count: notifications.count }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Delete notification
  deleteNotification = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.notifications.delete({ where: { id } });

      res.json({ message: 'Notification deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Bulk delete notifications
  bulkDeleteNotifications = async (req: Request, res: Response) => {
    try {
      const { ids, olderThan } = req.body;

      let where: any = {};
      if (ids && ids.length > 0) {
        where.id = { in: ids };
      } else if (olderThan) {
        where.created_at = { lt: new Date(olderThan) };
      }

      const result = await prisma.notifications.deleteMany({ where });

      res.json({ message: `Deleted ${result.count} notifications` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Get notification analytics
  getNotificationAnalytics = async (req: Request, res: Response) => {
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
        totalNotifications,
        byType,
        byChannel,
        readRate
      ] = await Promise.all([
        prisma.notifications.count({ where: whereClause }),
        prisma.notifications.groupBy({
          by: ['type'],
          where: whereClause,
          _count: true
        }),
        prisma.notifications.groupBy({
          by: ['channel'],
          where: whereClause,
          _count: true
        }),
        prisma.notifications.aggregate({
          where: whereClause,
          _count: { is_read: true }
        })
      ]);

      const readCount = await prisma.notifications.count({
        where: { ...whereClause, is_read: true }
      });

      res.json({
        data: {
          totalNotifications,
          readCount,
          unreadCount: totalNotifications - readCount,
          readRate: totalNotifications > 0 ? (readCount / totalNotifications * 100).toFixed(2) + '%' : '0%',
          byType: byType.reduce((acc: any, item) => {
            acc[item.type] = item._count;
            return acc;
          }, {}),
          byChannel: byChannel.reduce((acc: any, item) => {
            acc[item.channel || 'unknown'] = item._count;
            return acc;
          }, {})
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Clear old notifications
  clearOldNotifications = async (req: Request, res: Response) => {
    try {
      const { daysOld } = req.body;
      const cutoffDate = new Date(Date.now() - (daysOld || 30) * 24 * 60 * 60 * 1000);

      const result = await prisma.notifications.deleteMany({
        where: {
          created_at: { lt: cutoffDate },
          is_read: true
        }
      });

      res.json({ message: `Cleared ${result.count} old notifications` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}