import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

export class AdminController {
  // Session Management
  getAllSessions = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const status = req.query.status as string;
      const factoryId = req.query.factoryId as string;

      const where: any = {};
      if (status) where.status = status;
      if (factoryId) where.factory_id = factoryId;

      const [total, sessions] = await Promise.all([
        prisma.group_buying_sessions.count({ where }),
        prisma.group_buying_sessions.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            products: { select: { id: true, name: true, base_price: true } },
            factories: { select: { id: true, factory_name: true, city: true } },
            _count: { select: { group_participants: true } }
          }
        })
      ]);

      res.json({
        data: sessions,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getSessionDetails = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const session = await prisma.group_buying_sessions.findUnique({
        where: { id },
        include: {
          products: true,
          factories: true,
          group_participants: {
            include: {
              users: { select: { id: true, first_name: true, last_name: true, email: true } }
            }
          }
        }
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({ data: session });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updateSessionStatus = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, reason } = req.body;

      const session = await prisma.group_buying_sessions.update({
        where: { id },
        data: {
          status,
          updated_at: new Date()
        }
      });

      console.log(`Session ${id} status changed to ${status}. Reason: ${reason || 'Admin action'}`);

      res.json({
        message: 'Session status updated successfully',
        data: session
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  extendSession = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { newEndTime } = req.body;

      const session = await prisma.group_buying_sessions.update({
        where: { id },
        data: {
          end_time: new Date(newEndTime),
          updated_at: new Date()
        }
      });

      res.json({
        message: 'Session extended successfully',
        data: session
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  // Bundle Configuration (grosir_bundle_config)
  getBundleConfigs = async (req: Request, res: Response) => {
    try {
      const productId = req.query.productId as string;

      const where: any = {};
      if (productId) where.product_id = productId;

      const configs = await prisma.grosir_bundle_config.findMany({
        where,
        include: {
          products: { select: { id: true, name: true } },
          product_variants: { select: { id: true, variant_name: true, sku: true } }
        }
      });

      res.json({ data: configs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  createBundleConfig = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, variantId, unitsPerBundle } = req.body;

      const config = await prisma.grosir_bundle_config.create({
        data: {
          product_id: productId,
          variant_id: variantId || null,
          units_per_bundle: unitsPerBundle
        }
      });

      res.status(201).json({
        message: 'Bundle config created successfully',
        data: config
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Bundle config already exists for this product/variant' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  updateBundleConfig = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { unitsPerBundle } = req.body;

      const config = await prisma.grosir_bundle_config.update({
        where: { id },
        data: {
          units_per_bundle: unitsPerBundle,
          updated_at: new Date()
        }
      });

      res.json({
        message: 'Bundle config updated successfully',
        data: config
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Bundle config not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  deleteBundleConfig = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.grosir_bundle_config.delete({
        where: { id }
      });

      res.json({ message: 'Bundle config deleted successfully' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Bundle config not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  // Warehouse Tolerance (grosir_warehouse_tolerance)
  getWarehouseTolerances = async (req: Request, res: Response) => {
    try {
      const tolerances = await prisma.grosir_warehouse_tolerance.findMany({
        include: {
          warehouses: { select: { id: true, warehouse_name: true } },
          products: { select: { id: true, name: true } }
        }
      });

      res.json({ data: tolerances });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  createWarehouseTolerance = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { warehouseId, productId, maxExcessUnits } = req.body;

      const tolerance = await prisma.grosir_warehouse_tolerance.create({
        data: {
          warehouse_id: warehouseId,
          product_id: productId,
          max_excess_units: maxExcessUnits
        }
      });

      res.status(201).json({
        message: 'Warehouse tolerance created successfully',
        data: tolerance
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Tolerance already exists for this warehouse/product' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  updateWarehouseTolerance = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { maxExcessUnits } = req.body;

      const tolerance = await prisma.grosir_warehouse_tolerance.update({
        where: { id },
        data: {
          max_excess_units: maxExcessUnits,
          updated_at: new Date()
        }
      });

      res.json({
        message: 'Warehouse tolerance updated successfully',
        data: tolerance
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Tolerance not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  deleteWarehouseTolerance = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.grosir_warehouse_tolerance.delete({
        where: { id }
      });

      res.json({ message: 'Warehouse tolerance deleted successfully' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Tolerance not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  // Variant Allocations
  getVariantAllocations = async (req: Request, res: Response) => {
    try {
      const sessionId = req.query.sessionId as string;

      const where: any = {};
      if (sessionId) where.session_id = sessionId;

      const allocations = await prisma.grosir_variant_allocations.findMany({
        where,
        include: {
          group_buying_sessions: { select: { id: true, session_code: true } },
          product_variants: { select: { id: true, variant_name: true, sku: true } }
        }
      });

      res.json({ data: allocations });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updateVariantAllocation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { maxQuantity, currentQuantity } = req.body;

      const updateData: any = { updated_at: new Date() };
      if (maxQuantity !== undefined) updateData.max_quantity = maxQuantity;
      if (currentQuantity !== undefined) updateData.current_quantity = currentQuantity;

      const allocation = await prisma.grosir_variant_allocations.update({
        where: { id },
        data: updateData
      });

      res.json({
        message: 'Variant allocation updated successfully',
        data: allocation
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Allocation not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  // Analytics
  getSessionAnalytics = async (req: Request, res: Response) => {
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
        totalSessions,
        statusCounts,
        participantStats
      ] = await Promise.all([
        prisma.group_buying_sessions.count({ where: whereClause }),
        prisma.group_buying_sessions.groupBy({
          by: ['status'],
          where: whereClause,
          _count: true
        }),
        prisma.group_participants.aggregate({
          where: whereClause.created_at ? { created_at: whereClause.created_at } : {},
          _count: true,
          _sum: { quantity: true }
        })
      ]);

      const statusBreakdown: any = {};
      statusCounts.forEach(item => {
        statusBreakdown[item.status] = item._count;
      });

      res.json({
        data: {
          totalSessions,
          statusBreakdown,
          participants: {
            total: participantStats._count,
            totalQuantity: participantStats._sum.quantity || 0
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Get complete configuration for a product
  getProductConfig = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;

      const [bundleConfigs, tolerances, product] = await Promise.all([
        prisma.grosir_bundle_config.findMany({
          where: { product_id: productId },
          include: { product_variants: true }
        }),
        prisma.grosir_warehouse_tolerance.findMany({
          where: { product_id: productId },
          include: { warehouses: true }
        }),
        prisma.products.findUnique({
          where: { id: productId },
          select: { id: true, name: true, grosir_unit_size: true }
        })
      ]);

      res.json({
        data: {
          product,
          bundleConfigs,
          warehouseTolerances: tolerances
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
