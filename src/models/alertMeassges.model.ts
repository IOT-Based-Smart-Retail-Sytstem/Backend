import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./user.model";

export enum AlertMessageTime {
    NEW = 'new',
    YESTERDAY = 'yesterday',
    EARLIER = 'earlier'
}

export class AlertMeassge {
    @prop({ required: true })
    title: string;

    @prop({ required: true })
    message: string;

    @prop({ required: true, enum: AlertMessageTime, default: AlertMessageTime.NEW })
    time: AlertMessageTime;

    @prop({ required: false, default: false })
    isRead: boolean;

    @prop({ ref: () => User, required: true })
    user: Ref<User> | null;
  
    @prop({ required: false, default: Date.now })
    createdAt: Date;
}

const AlertMeassgeModel = getModelForClass(AlertMeassge);

export default AlertMeassgeModel; 