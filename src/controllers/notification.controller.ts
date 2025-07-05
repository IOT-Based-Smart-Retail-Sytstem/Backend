import { Request, Response } from 'express';
import { createNotification, getUserNotifications, markAllAsRead, clearAll, clearNotification } from '../service/notification.service';
import { CustomError } from '../utils/custom.error';
import { Code } from '../utils/httpStatus';

export class NotificationController {
    static async getUserNotifications(req: Request, res: Response) {
        try {
            const userId = res.locals.user?._id;
            if (!userId) throw new CustomError('User not authenticated', Code.Unauthorized);
            const notifications = await getUserNotifications(userId);
            const withLabels = notifications.map(n => ({
                ...n.toObject(),
                timeLabel: NotificationController.getTimeLabel(n.createdAt)
            }));
            res.status(Code.OK).json({ success: true, data: withLabels });
        } catch (error) {
            res.status(Code.InternalServerError).json({ success: false, message: 'Internal server error' });
        }
    }

    private static getTimeLabel(createdAt: Date): string {
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'New';
        if (diffDays === 1) return 'Yesterday';
        return 'Earlier';
    }

    static async markAllAsRead(req: Request, res: Response) {
        try {
            const userId = res.locals.user?._id;
            if (!userId) throw new CustomError('User not authenticated', Code.Unauthorized);
            await markAllAsRead(userId);
            res.status(Code.OK).json({ success: true });
        } catch (error) {
            res.status(Code.InternalServerError).json({ success: false, message: 'Internal server error' });
        }
    }

    static async clearAllNotifications(req: Request, res: Response) {
        try {
            const userId = res.locals.user?._id;
            if (!userId) throw new CustomError('User not authenticated', Code.Unauthorized);
            await clearAll(userId);
            res.status(Code.OK).json({ success: true });
        } catch (error) {
            res.status(Code.InternalServerError).json({ success: false, message: 'Internal server error' });
        }
    }

    static async clearOneNotification(req: Request, res: Response) {
        try {
            const notificationId = req.params.id;
            if (!notificationId) throw new CustomError('Notification ID is required', Code.BadRequest);
            await clearNotification(notificationId);
            res.status(Code.OK).json({ success: true });
        } catch (error) {
            res.status(Code.InternalServerError).json({ success: false, message: 'Internal server error' });
        }
    }

    
    static async createNotification(req: Request, res: Response) {
        try {
            const recipientId = req.body.recipientId || res.locals.user?._id;
            const { title, message, type } = req.body;
            if (!recipientId) throw new CustomError('User not authenticated', Code.Unauthorized);
            if (!title || !message || !type) throw new CustomError('Missing required fields', Code.BadRequest);
            const notification = await createNotification({ userId: recipientId, title, message, type });
            res.status(Code.Created).json({ success: true, data: notification });
        } catch (error) {
            console.log(error);
            //res with error message
            res.status(Code.InternalServerError).json({ success: false, message: error instanceof Error ? error.message : 'Internal server error' });
        }
    }
} 