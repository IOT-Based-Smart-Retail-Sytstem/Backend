import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./user.model";

export enum NotificationType {
    INVENTORY_ALERT = 'inventory_alert',
    SALES_NOTIFICATION = 'sales_notification',
    CUSTOMER_ACTIVITY = 'customer_activity',
    SECURITY_ALERT = 'security_alert',
    GENERAL = 'general',
    PAYMENT_SUCCESS = 'payment_success',
    PAYMENT_FAILED = 'payment_failed',
}

export class Notification {
    @prop({ required: true })
    title: string;

    @prop({ required: true })
    message: string;

    @prop({ required: true, enum: NotificationType })
    type: NotificationType;

    @prop({ ref: () => User, required: true })
    user: Ref<User>;

    @prop({ default: false })
    isRead: boolean;

    @prop({ default: Date.now })
    createdAt: Date;
}

const NotificationModel = getModelForClass(Notification, {
    schemaOptions: { timestamps: true, collection: 'notifications' }
});
export default NotificationModel; 