import AlertMeassgeModel, { AlertMessageTime } from '../models/alertMeassges.model';
import { differenceInCalendarDays } from 'date-fns';

export async function getUserAlertsWithTime(userId: string) {
    const now = new Date();
    const alerts = await AlertMeassgeModel.find({ user: userId }).sort({ createdAt: -1 });
    return alerts.map(alert => {
        const daysDiff = differenceInCalendarDays(now, alert.createdAt);
        let time: 'new' | 'yesterday' | 'earlier' = 'new';
        if (daysDiff === 1) time = 'yesterday';
        else if (daysDiff > 1) time = 'earlier';
        return { ...alert.toObject(), time };
    });
}

export async function markAllAsRead(userId: string) {
    await AlertMeassgeModel.updateMany({ user: userId, isRead: false }, { isRead: true });
}

export async function clearAll(userId: string) {
    await AlertMeassgeModel.deleteMany({ user: userId });
}

export async function clearAlert(userId: string, alertId: string) {
    await AlertMeassgeModel.deleteOne({ _id: alertId, user: userId });
}

export async function createInventoryAlert({ productTitle, userId }: { productTitle: string, userId: string }) {
    return await AlertMeassgeModel.create({
        title: 'Inventory Notifications',
        message: `Product ${productTitle} has been out of stock.`,
        time: AlertMessageTime.NEW,
        isRead: false,
        user: userId
    });
} 