import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import requireUser from '../middlware/requireUser';
import validateResource from '../middlware/validateResource';
import { createNotificationSchema } from '../schema/user/notification.schema';

const router = Router();

// All routes require authentication
router.use(requireUser);

// Get user notifications 
router.get('/', NotificationController.getUserNotifications);

// Mark all notifications as read
router.patch('/mark-all-read', NotificationController.markAllAsRead);

// Clear all notifications
router.delete('/', NotificationController.clearAllNotifications);

// Clear one notification
router.delete('/:id', NotificationController.clearOneNotification);

// Create notification (admin only)
router.post('/', validateResource(createNotificationSchema), NotificationController.createNotification);

export default router;