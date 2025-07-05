import { object, string, TypeOf, enum as zodEnum, optional } from "zod";
import { NotificationType } from "../../models/notification.model";

export const createNotificationSchema = object({
    body: object({
        recipientId: string({ required_error: 'Recipient ID is required' }),
        title: string({ required_error: 'Title is required' }).min(1, 'Title cannot be empty'),
        message: string({ required_error: 'Message is required' }).min(1, 'Message cannot be empty'),
        type: zodEnum([
            NotificationType.INVENTORY_ALERT,
            NotificationType.SALES_NOTIFICATION,
            NotificationType.CUSTOMER_ACTIVITY,
            NotificationType.SECURITY_ALERT,
            NotificationType.GENERAL,
            NotificationType.PAYMENT_SUCCESS,
            NotificationType.PAYMENT_FAILED
        ], {
            required_error: 'Notification type is required',
            invalid_type_error: 'Invalid notification type'
        }),
        metadata: optional(object({
            imageUrl: optional(string()),
            actionUrl: optional(string()),
            actionText: optional(string()),
            productId: optional(string()),
            orderId: optional(string()),
            amount: optional(string()),
            currency: optional(string())
        }))
    })
});

export type CreateNotificationInput = TypeOf<typeof createNotificationSchema>["body"]; 