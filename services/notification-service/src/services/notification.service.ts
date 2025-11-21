import { prisma } from '@repo/database';
import { CreateNotificationDTO } from '../types';
import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

// ============= API Helper Methods =============

// Auth Service helper - fetch single user
async function fetchUser(userId: string): Promise<any | null> {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/users/${userId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch user ${userId}:`, error);
    return null;
  }
}

// Auth Service helper - fetch multiple users
async function fetchUsersBatch(userIds: string[]): Promise<any[]> {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/api/auth/users/batch`, {
      ids: userIds
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch users batch:', error);
    return [];
  }
}

// ============= End API Helper Methods =============

export class NotificationService {
  async createNotification(data: CreateNotificationDTO) {
    const notification = await prisma.notifications.create({
      data: {
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        action_url: data.actionUrl,
        related_id: data.relatedId
      }
    });

    // TODO: Send push notification if enabled
    // TODO: Send email notification if enabled

    return notification;
  }

  async getUserNotifications(userId: string, limit = 50, offset = 0) {
    const notifications = await prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.notifications.count({
      where: { user_id: userId }
    });

    const unreadCount = await prisma.notifications.count({
      where: { user_id: userId, is_read: false }
    });

    return {
      notifications,
      total,
      unreadCount
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notifications.findFirst({
      where: {
        id: notificationId,
        user_id: userId
      }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notifications.update({
      where: { id: notificationId },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notifications.updateMany({
      where: {
        user_id: userId,
        is_read: false
      },
      data: {
        is_read: true,
        read_at: new Date()
      }
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notifications.findFirst({
      where: {
        id: notificationId,
        user_id: userId
      }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.notifications.delete({
      where: { id: notificationId }
    });
  }

  // Get user phone number for WhatsApp via auth-service API
  async getUserPhone(userId: string): Promise<string | null> {
    const user = await fetchUser(userId);
    return user?.phoneNumber || null;
  }

  // Get multiple users' phone numbers via auth-service API
  async getUserPhones(userIds: string[]): Promise<Map<string, string>> {
    const phoneMap = new Map<string, string>();
    const users = await fetchUsersBatch(userIds);

    users.forEach((user: any) => {
      if (user.phoneNumber) {
        phoneMap.set(user.userId, user.phoneNumber);
      }
    });

    return phoneMap;
  }
}
