import { prisma } from '../lib/prisma';
import { Response } from 'express';
import { NotificationType } from '@prisma/client';

// Keep track of active SSE connections by userId
const activeClients = new Map<string, Response[]>();

/**
 * Register an active SSE response stream for a user
 */
export const registerNotificationClient = (userId: string, res: Response) => {
  if (!activeClients.has(userId)) {
    activeClients.set(userId, []);
  }
  activeClients.get(userId)!.push(res);
  console.log(`[NotificationService] Registered client for user ${userId}. Total clients: ${activeClients.get(userId)!.length}`);
};

/**
 * Unregister an active SSE response stream for a user
 */
export const unregisterNotificationClient = (userId: string, res: Response) => {
  const clients = activeClients.get(userId);
  if (clients) {
    const updatedClients = clients.filter((c) => c !== res);
    if (updatedClients.length === 0) {
      activeClients.delete(userId);
    } else {
      activeClients.set(userId, updatedClients);
    }
  }
  console.log(`[NotificationService] Unregistered client for user ${userId}.`);
};

/**
 * Send a real-time notification to all active streams of a user
 */
export const sendRealtimeNotification = (userId: string, notification: any) => {
  const clients = activeClients.get(userId);
  if (clients && clients.length > 0) {
    console.log(`[NotificationService] Dispatching real-time notification to ${clients.length} clients for user ${userId}`);
    const data = `data: ${JSON.stringify(notification)}\n\n`;
    for (const client of clients) {
      try {
        client.write(data);
        // If the client has a flush method (compression middleware), call it
        if ((client as any).flush) {
          (client as any).flush();
        }
      } catch (err) {
        console.error(`[NotificationService] Failed to write to client for user ${userId}:`, err);
      }
    }
  }
};

/**
 * Create a new notification, save to DB, and dispatch in real-time
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'INFO'
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        read: false,
      },
    });

    // Send in real-time to active SSE clients
    sendRealtimeNotification(userId, notification);
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error);
    throw error;
  }
};
