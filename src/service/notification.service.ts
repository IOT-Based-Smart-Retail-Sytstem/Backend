import NotificationModel, { NotificationType } from '../models/notification.model';
import { notificationSocketService } from '../app';

export async function createNotification({ userId, title, message, type }: { userId: string, title: string, message: string, type: NotificationType }) {
    try {
        const notification = await NotificationModel.create({ user: userId, title, message, type });
        await notificationSocketService.sendNotification(userId, notification);
        return notification;
    } catch (error) {
        throw new Error(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getUserNotifications(userId: string) {
    try {
        return await NotificationModel.find({ user: userId }).sort({ createdAt: -1 });
    } catch (error) {
        throw new Error(`Failed to get user notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function markAllAsRead(userId: string) {
    try {
        await NotificationModel.updateMany({ user: userId, isRead: false }, { isRead: true });
    } catch (error) {
        throw new Error(`Failed to mark notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function clearAll(userId: string) {
    try {
        await NotificationModel.deleteMany({ user: userId });
    } catch (error) {
        throw new Error(`Failed to clear notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
} 

export async function clearNotification(notificationId: string) {
    try {
        await NotificationModel.deleteOne({ _id: notificationId });
    } catch (error) {
        throw new Error(`Failed to clear notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}