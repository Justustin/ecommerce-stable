import { Request, Response } from 'express';
import { getConnectionStatus, startWhatsApp } from '../whatsappService';

export class AdminController {
  // Get connection status
  getStatus = async (req: Request, res: Response) => {
    try {
      const status = getConnectionStatus();
      res.json({
        data: {
          ...status,
          service: 'whatsapp-service',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Restart WhatsApp connection
  restartConnection = async (req: Request, res: Response) => {
    try {
      startWhatsApp();
      res.json({ message: 'WhatsApp connection restart initiated' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Health check
  healthCheck = async (req: Request, res: Response) => {
    try {
      const status = getConnectionStatus();
      res.json({
        healthy: status.isConnected,
        service: 'whatsapp-service',
        connection: status.isConnected ? 'connected' : 'disconnected',
        user: status.user?.name || null
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
