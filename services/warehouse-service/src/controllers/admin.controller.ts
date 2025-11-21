import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@repo/database';

const prisma = new PrismaClient();

export class AdminController {
  // Inventory Management
  getInventory = async (req: Request, res: Response) => {
    try {
      const { warehouseId, productId } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (warehouseId) where.warehouse_id = warehouseId;
      if (productId) where.product_id = productId;

      const [total, inventory] = await Promise.all([
        prisma.warehouse_inventory.count({ where }),
        prisma.warehouse_inventory.findMany({
          where,
          skip,
          take: limit,
          include: {
            warehouses: { select: { id: true, warehouse_name: true } },
            products: { select: { id: true, name: true, sku: true } },
            product_variants: { select: { id: true, variant_name: true, sku: true } }
          }
        })
      ]);

      res.json({
        data: inventory,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  adjustStock = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { adjustment, reason, adjustedBy } = req.body;

      const inventory = await prisma.warehouse_inventory.findUnique({ where: { id } });
      if (!inventory) {
        return res.status(404).json({ error: 'Inventory record not found' });
      }

      const newQuantity = inventory.quantity + adjustment;
      if (newQuantity < 0) {
        return res.status(400).json({ error: 'Adjustment would result in negative stock' });
      }

      const updated = await prisma.warehouse_inventory.update({
        where: { id },
        data: {
          quantity: newQuantity,
          updated_at: new Date()
        }
      });

      // Log the adjustment
      console.log(`Stock adjusted for inventory ${id}: ${adjustment} units. Reason: ${reason}. By: ${adjustedBy}`);

      res.json({
        message: 'Stock adjusted successfully',
        data: updated,
        adjustment: { previous: inventory.quantity, new: newQuantity, change: adjustment, reason }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  reserveStock = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { quantity, orderId } = req.body;

      const inventory = await prisma.warehouse_inventory.findUnique({ where: { id } });
      if (!inventory) {
        return res.status(404).json({ error: 'Inventory record not found' });
      }

      const availableQty = inventory.quantity - (inventory.reserved_quantity || 0);
      if (quantity > availableQty) {
        return res.status(400).json({ error: 'Insufficient available stock', available: availableQty });
      }

      const updated = await prisma.warehouse_inventory.update({
        where: { id },
        data: {
          reserved_quantity: (inventory.reserved_quantity || 0) + quantity,
          updated_at: new Date()
        }
      });

      res.json({
        message: 'Stock reserved successfully',
        data: updated,
        reservation: { quantity, orderId }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  releaseReservation = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const inventory = await prisma.warehouse_inventory.findUnique({ where: { id } });
      if (!inventory) {
        return res.status(404).json({ error: 'Inventory record not found' });
      }

      const newReserved = Math.max(0, (inventory.reserved_quantity || 0) - quantity);

      const updated = await prisma.warehouse_inventory.update({
        where: { id },
        data: {
          reserved_quantity: newReserved,
          updated_at: new Date()
        }
      });

      res.json({
        message: 'Reservation released successfully',
        data: updated
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Purchase Orders
  getPurchaseOrders = async (req: Request, res: Response) => {
    try {
      const { status, warehouseId, factoryId } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      if (warehouseId) where.warehouse_id = warehouseId;
      if (factoryId) where.factory_id = factoryId;

      const [total, orders] = await Promise.all([
        prisma.warehouse_purchase_orders.count({ where }),
        prisma.warehouse_purchase_orders.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            warehouses: { select: { id: true, warehouse_name: true } },
            factories: { select: { id: true, factory_name: true } }
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

  updatePurchaseOrderStatus = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, notes } = req.body;

      const order = await prisma.warehouse_purchase_orders.update({
        where: { id },
        data: {
          status,
          updated_at: new Date()
        }
      });

      res.json({
        message: 'Purchase order status updated',
        data: order
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Purchase order not found' });
      }
      res.status(500).json({ error: error.message });
    }
  };

  // Audit & Reports
  getStockAudit = async (req: Request, res: Response) => {
    try {
      const { warehouseId } = req.query;

      const where: any = {};
      if (warehouseId) where.warehouse_id = warehouseId;

      const inventory = await prisma.warehouse_inventory.findMany({
        where,
        include: {
          warehouses: { select: { warehouse_name: true } },
          products: { select: { name: true, sku: true } },
          product_variants: { select: { variant_name: true, sku: true } }
        }
      });

      const audit = inventory.map(item => ({
        id: item.id,
        warehouse: item.warehouses?.warehouse_name,
        product: item.products?.name,
        variant: item.product_variants?.variant_name,
        sku: item.product_variants?.sku || item.products?.sku,
        totalQuantity: item.quantity,
        reservedQuantity: item.reserved_quantity || 0,
        availableQuantity: item.quantity - (item.reserved_quantity || 0),
        lastUpdated: item.updated_at
      }));

      res.json({ data: audit });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getLowStockItems = async (req: Request, res: Response) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 10;

      const lowStock = await prisma.warehouse_inventory.findMany({
        where: {
          quantity: { lte: threshold }
        },
        include: {
          warehouses: { select: { warehouse_name: true } },
          products: { select: { name: true, sku: true } }
        },
        orderBy: { quantity: 'asc' }
      });

      res.json({
        data: lowStock,
        threshold
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
