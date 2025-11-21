import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

export class AdminController {
  // Get all addresses
  getAllAddresses = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const { userId, district, isDefault } = req.query;

      const where: any = {};
      if (userId) where.user_id = userId;
      if (district) where.district = { contains: district as string, mode: 'insensitive' };
      if (isDefault !== undefined) where.is_default = isDefault === 'true';

      const [total, addresses] = await Promise.all([
        prisma.user_addresses.count({ where }),
        prisma.user_addresses.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            users: { select: { id: true, first_name: true, last_name: true, phone_number: true } }
          }
        })
      ]);

      res.json({
        data: addresses,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Get address details
  getAddressDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const address = await prisma.user_addresses.findUnique({
        where: { id },
        include: {
          users: { select: { id: true, first_name: true, last_name: true, phone_number: true, email: true } }
        }
      });

      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }

      res.json({ data: address });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Update address
  updateAddress = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      const updated = await prisma.user_addresses.update({
        where: { id },
        data: {
          ...req.body,
          updated_at: new Date()
        }
      });

      res.json({ message: 'Address updated', data: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Delete address
  deleteAddress = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.user_addresses.delete({ where: { id } });

      res.json({ message: 'Address deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Bulk delete addresses
  bulkDeleteAddresses = async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;

      const result = await prisma.user_addresses.deleteMany({
        where: { id: { in: ids } }
      });

      res.json({ message: `Deleted ${result.count} addresses` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Get address analytics
  getAddressAnalytics = async (req: Request, res: Response) => {
    try {
      const [
        totalAddresses,
        addressesByDistrict,
        usersWithMultipleAddresses
      ] = await Promise.all([
        prisma.user_addresses.count(),
        prisma.user_addresses.groupBy({
          by: ['district'],
          _count: true,
          orderBy: { _count: { district: 'desc' } },
          take: 20
        }),
        prisma.user_addresses.groupBy({
          by: ['user_id'],
          _count: true,
          having: { user_id: { _count: { gt: 1 } } }
        })
      ]);

      res.json({
        data: {
          totalAddresses,
          topDistricts: addressesByDistrict.map(d => ({
            district: d.district,
            count: d._count
          })),
          usersWithMultipleAddresses: usersWithMultipleAddresses.length
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
