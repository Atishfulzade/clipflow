import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  registerNotificationClient,
  unregisterNotificationClient,
  createNotification,
} from '../services/notifications';

/**
 * List all notifications for the authenticated user
 */
export const listNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(notifications);
  } catch (error: any) {
    console.error('[NotificationsController] List error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id, userId: req.user.id },
      data: { read: true },
    });

    res.json(notification);
  } catch (error: any) {
    console.error('[NotificationsController] MarkAsRead error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

/**
 * Mark all notifications for the user as read
 */
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('[NotificationsController] MarkAllAsRead error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

/**
 * Establish a Server-Sent Events (SSE) stream for real-time notifications
 */
export const notificationStream = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = req.user.id;

    // Set headers for SSE stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Disable buffering in Nginx if needed
    res.setHeader('X-Accel-Buffering', 'no');

    // Establish SSE handshake
    res.write(': connected\n\n');
    if ((res as any).flush) {
      (res as any).flush();
    }

    // Register this response connection in the service
    registerNotificationClient(userId, res);

    // Keep connection alive with periodic heartbeats (every 20 seconds)
    const keepAliveInterval = setInterval(() => {
      res.write(': keepalive\n\n');
      if ((res as any).flush) {
        (res as any).flush();
      }
    }, 20000);

    // Unregister when client closes connection
    req.on('close', () => {
      clearInterval(keepAliveInterval);
      unregisterNotificationClient(userId, res);
    });
  } catch (error) {
    console.error('[NotificationsController] Stream error:', error);
    res.end();
  }
};
