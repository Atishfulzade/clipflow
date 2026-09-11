import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  notificationStream,
} from '../controllers/notifications';

const router = Router();

// Retrieve all notifications
router.get('/', listNotifications as any);

// Mark all notifications as read
router.post('/read-all', markAllAsRead as any);

// Mark a specific notification as read
router.post('/:id/read', markAsRead as any);

// Server-Sent Events (SSE) stream for real-time push
router.get('/stream', notificationStream as any);

export default router;
