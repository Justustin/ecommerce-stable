import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

export class AdminController {
  // Factory Management
  registerFactory = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        ownerId, factoryCode, factoryName, phoneNumber, email,
        province, city, district, postalCode, addressLine,
        description, businessLicenseNumber, taxId, logoUrl
      } = req.body;

      const factory = await prisma.factories.create({
        data: {
          owner_id: ownerId,
          factory_code: factoryCode,
          factory_name: factoryName,
          phone_number: phoneNumber,
          email: email || null,
          province,
          city,
          district,
          postal_code: postalCode || null,
          address_line: addressLine,
          description: description || null,
          business_license_number: businessLicenseNumber || null,
          tax_id: taxId || null,
          logo_url: logoUrl || null
        }
      });

      res.status(201).json({
        message: 'Factory registered successfully',
        data: factory
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Factory with this code or license already exists' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  updateFactory = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updateData: any = { updated_at: new Date() };

      const fields = [
        'factoryName', 'phoneNumber', 'email', 'province', 'city',
        'district', 'postalCode', 'addressLine', 'description',
        'businessLicenseNumber', 'taxId', 'logoUrl'
      ];

      const fieldMap: any = {
        factoryName: 'factory_name',
        phoneNumber: 'phone_number',
        email: 'email',
        province: 'province',
        city: 'city',
        district: 'district',
        postalCode: 'postal_code',
        addressLine: 'address_line',
        description: 'description',
        businessLicenseNumber: 'business_license_number',
        taxId: 'tax_id',
        logoUrl: 'logo_url'
      };

      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[fieldMap[field]] = req.body[field];
        }
      });

      const factory = await prisma.factories.update({
        where: { id },
        data: updateData
      });

      res.json({
        message: 'Factory updated successfully',
        data: factory
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Factory not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  deleteFactory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check for active sessions
      const activeSessions = await prisma.group_buying_sessions.count({
        where: {
          factory_id: id,
          status: { in: ['forming', 'active', 'moq_reached', 'pending_stock'] }
        }
      });

      if (activeSessions > 0) {
        return res.status(400).json({
          error: 'Cannot delete factory with active sessions',
          activeSessions
        });
      }

      await prisma.factories.delete({
        where: { id }
      });

      res.json({
        message: 'Factory deleted successfully'
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Factory not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  verifyFactory = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { verifiedBy } = req.body;

      const factory = await prisma.factories.update({
        where: { id },
        data: {
          verification_status: 'verified',
          verified_at: new Date(),
          verified_by: verifiedBy,
          status: 'active',
          updated_at: new Date()
        }
      });

      res.json({
        message: 'Factory verified successfully',
        data: factory
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Factory not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  suspendFactory = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { reason, suspensionDuration } = req.body;

      const factory = await prisma.factories.update({
        where: { id },
        data: {
          status: 'suspended',
          updated_at: new Date()
        }
      });

      // Log suspension reason (could be stored in audit_logs table)
      console.log(`Factory ${id} suspended. Reason: ${reason}, Duration: ${suspensionDuration || 'indefinite'}`);

      res.json({
        message: 'Factory suspended successfully',
        data: factory,
        suspensionDetails: {
          reason,
          duration: suspensionDuration || 'indefinite'
        }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Factory not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  reactivateFactory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const factory = await prisma.factories.update({
        where: { id },
        data: {
          status: 'active',
          updated_at: new Date()
        }
      });

      res.json({
        message: 'Factory reactivated successfully',
        data: factory
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Factory not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  // Analytics & Metrics
  getFactoryMetrics = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) dateFilter.lte = new Date(endDate as string);

      const whereClause: any = { factory_id: id };
      if (Object.keys(dateFilter).length > 0) {
        whereClause.created_at = dateFilter;
      }

      // Get session metrics
      const [totalSessions, successfulSessions, failedSessions] = await Promise.all([
        prisma.group_buying_sessions.count({ where: whereClause }),
        prisma.group_buying_sessions.count({ where: { ...whereClause, status: 'success' } }),
        prisma.group_buying_sessions.count({ where: { ...whereClause, status: 'failed' } })
      ]);

      // Get revenue from successful sessions
      const revenueData = await prisma.group_buying_sessions.aggregate({
        where: { ...whereClause, status: 'success' },
        _sum: { group_price: true },
        _avg: { group_price: true }
      });

      // Get participant counts
      const participantData = await prisma.group_participants.aggregate({
        where: {
          group_buying_sessions: whereClause
        },
        _count: true,
        _sum: { quantity: true }
      });

      res.json({
        data: {
          sessions: {
            total: totalSessions,
            successful: successfulSessions,
            failed: failedSessions,
            successRate: totalSessions > 0 ? ((successfulSessions / totalSessions) * 100).toFixed(2) : 0
          },
          revenue: {
            total: revenueData._sum.group_price || 0,
            averagePerSession: revenueData._avg.group_price || 0
          },
          participants: {
            total: participantData._count,
            totalQuantity: participantData._sum.quantity || 0
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getFactorySessions = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [total, sessions] = await Promise.all([
        prisma.group_buying_sessions.count({ where: { factory_id: id } }),
        prisma.group_buying_sessions.findMany({
          where: { factory_id: id },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            products: {
              select: {
                id: true,
                name: true,
                base_price: true
              }
            },
            _count: {
              select: { group_participants: true }
            }
          }
        })
      ]);

      res.json({
        data: sessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  forceCancelSession = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id, sessionId } = req.params;
      const { reason, refundParticipants } = req.body;

      // Verify session belongs to factory
      const session = await prisma.group_buying_sessions.findFirst({
        where: { id: sessionId, factory_id: id }
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found for this factory' });
      }

      if (session.status === 'success' || session.status === 'failed' || session.status === 'cancelled') {
        return res.status(400).json({ error: `Cannot cancel session with status: ${session.status}` });
      }

      // Update session status
      const updatedSession = await prisma.group_buying_sessions.update({
        where: { id: sessionId },
        data: {
          status: 'cancelled',
          updated_at: new Date()
        }
      });

      // TODO: Trigger refunds if refundParticipants is true
      if (refundParticipants) {
        console.log(`Refund triggered for session ${sessionId}. Reason: ${reason}`);
        // Integrate with payment-service refund endpoint
      }

      res.json({
        message: 'Session cancelled successfully',
        data: updatedSession,
        cancellationDetails: {
          reason,
          refundTriggered: refundParticipants || false
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getFactoryAnalytics = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);

      // Get monthly breakdown
      const sessions = await prisma.group_buying_sessions.findMany({
        where: {
          factory_id: id,
          created_at: {
            gte: startOfYear,
            lte: endOfYear
          }
        },
        include: {
          products: {
            select: { id: true, name: true }
          },
          _count: {
            select: { group_participants: true }
          }
        }
      });

      // Aggregate by month
      const monthlyData: any = {};
      for (let i = 0; i < 12; i++) {
        monthlyData[i] = {
          month: i + 1,
          sessions: 0,
          successful: 0,
          failed: 0,
          participants: 0
        };
      }

      sessions.forEach(session => {
        const month = session.created_at.getMonth();
        monthlyData[month].sessions++;
        if (session.status === 'success') monthlyData[month].successful++;
        if (session.status === 'failed') monthlyData[month].failed++;
        monthlyData[month].participants += session._count.group_participants;
      });

      // Get top products
      const productCounts: any = {};
      sessions.forEach(session => {
        if (session.products) {
          const productId = session.products.id;
          if (!productCounts[productId]) {
            productCounts[productId] = {
              id: productId,
              name: session.products.name,
              sessionCount: 0
            };
          }
          productCounts[productId].sessionCount++;
        }
      });

      const topProducts = Object.values(productCounts)
        .sort((a: any, b: any) => b.sessionCount - a.sessionCount)
        .slice(0, 5);

      res.json({
        data: {
          year,
          monthlyBreakdown: Object.values(monthlyData),
          summary: {
            totalSessions: sessions.length,
            successfulSessions: sessions.filter(s => s.status === 'success').length,
            failedSessions: sessions.filter(s => s.status === 'failed').length
          },
          topProducts
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
