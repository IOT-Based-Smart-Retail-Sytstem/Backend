import { createNotification } from './notification.service';
import { NotificationType } from '../models/notification.model';

export async function sendInventoryAlert(userId: string, productTitle: string) {
    return createNotification({
        userId,
        title: 'Inventory Alert',
        message: `Product ${productTitle} is out of stock.`,
        type: NotificationType.INVENTORY_ALERT
    });
}

export async function sendLowStockAlert(userId: string, productTitle: string, currentStock: number) {
    return createNotification({
        userId,
        title: 'Low Stock Alert',
        message: `Product ${productTitle} is running low on stock (${currentStock} remaining).`,
        type: NotificationType.INVENTORY_ALERT
    });
}

export async function sendRestockNotification(userId: string, productTitle: string, newStock: number) {
    return createNotification({
        userId,
        title: 'Product Restocked',
        message: `Product ${productTitle} has been restocked. New stock: ${newStock}`,
        type: NotificationType.INVENTORY_ALERT
    });
}

export async function sendSalesNotification(userId: string, salesMessage: string) {
    return createNotification({
        userId,
        title: 'Sales Notification',
        message: salesMessage,
        type: NotificationType.SALES_NOTIFICATION
    });
}

export async function sendCustomerActivity(userId: string, activityMessage: string) {
    return createNotification({
        userId,
        title: 'Customer Activity',
        message: activityMessage,
        type: NotificationType.CUSTOMER_ACTIVITY
    });
}

export async function sendSecurityAlert(userId: string, alertMessage: string) {
    return createNotification({
        userId,
        title: 'Security Alert',
        message: alertMessage,
        type: NotificationType.SECURITY_ALERT
    });
}

export async function sendGeneralNotification(userId: string, title: string, message: string) {
    return createNotification({
        userId,
        title,
        message,
        type: NotificationType.GENERAL
    });
}

export async function sendPaymentSuccessNotification(userId: string, orderId: string) {
    return createNotification({
        userId,
        title: 'Payment Successful',
        message: `Payment of order ${orderId} was successful.`,
        type: NotificationType.PAYMENT_SUCCESS
    });
}

export async function sendPaymentFailedNotification(userId: string, orderId: string) {
    return createNotification({
        userId,
        title: 'Payment Failed',
        message: `Payment of order ${orderId} was failed.`,
        type: NotificationType.PAYMENT_FAILED
    });
}
