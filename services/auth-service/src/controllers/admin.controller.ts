import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

export class AdminController {
  // Get all users
  getAllUsers = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const { role, isActive, search } = req.query;

      const where: any = {};
      if (role) where.role = role;
      if (isActive !== undefined) where.is_active = isActive === 'true';
      if (search) {
        where.OR = [
          { first_name: { contains: search as string, mode: 'insensitive' } },
          { last_name: { contains: search as string, mode: 'insensitive' } },
          { phone_number: { contains: search as string } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [total, users] = await Promise.all([
        prisma.users.count({ where }),
        prisma.users.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            phone_number: true,
            email: true,
            role: true,
            is_active: true,
            created_at: true,
            updated_at: true
          }
        })
      ]);

      res.json({
        data: users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Get user details
  getUserDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const user = await prisma.users.findUnique({
        where: { id },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          phone_number: true,
          email: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
          wallets: true,
          addresses: true,
          _count: {
            select: {
              orders: true,
              cart_items: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ data: user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Update user
  updateUser = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { firstName, lastName, email, role, isActive } = req.body;

      const updated = await prisma.users.update({
        where: { id },
        data: {
          first_name: firstName,
          last_name: lastName,
          email,
          role,
          is_active: isActive,
          updated_at: new Date()
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          phone_number: true,
          email: true,
          role: true,
          is_active: true
        }
      });

      res.json({ message: 'User updated', data: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Toggle user status
  toggleUserStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive, reason } = req.body;

      const updated = await prisma.users.update({
        where: { id },
        data: {
          is_active: isActive,
          updated_at: new Date()
        }
      });

      res.json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: updated
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Update user role
  updateUserRole = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const updated = await prisma.users.update({
        where: { id },
        data: {
          role,
          updated_at: new Date()
        }
      });

      res.json({ message: 'User role updated', data: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Delete user
  deleteUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.users.delete({ where: { id } });

      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Get OTP records
  getOTPRecords = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const [total, otps] = await Promise.all([
        prisma.otps.count(),
        prisma.otps.findMany({
          skip,
          take: limit,
          orderBy: { created_at: 'desc' }
        })
      ]);

      res.json({
        data: otps,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Clear expired OTPs
  clearExpiredOTPs = async (req: Request, res: Response) => {
    try {
      const result = await prisma.otps.deleteMany({
        where: {
          expires_at: { lt: new Date() }
        }
      });

      res.json({ message: `Cleared ${result.count} expired OTPs` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Get user analytics
  getUserAnalytics = async (req: Request, res: Response) => {
    try {
      const [
        totalUsers,
        usersByRole,
        activeUsers,
        recentSignups
      ] = await Promise.all([
        prisma.users.count(),
        prisma.users.groupBy({
          by: ['role'],
          _count: true
        }),
        prisma.users.count({ where: { is_active: true } }),
        prisma.users.count({
          where: {
            created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        })
      ]);

      res.json({
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          recentSignups,
          byRole: usersByRole.reduce((acc: any, item) => {
            acc[item.role] = item._count;
            return acc;
          }, {})
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
