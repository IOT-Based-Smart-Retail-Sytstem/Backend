import { object, string, boolean, TypeOf, enum as zodEnum, date } from "zod";
import { AlertMessageTime } from "../../models/alertMeassges.model";

export const createAlertMeassgeSchema = object({
    body: object({
        title: string({ required_error: 'title is required' }).optional(),
        message: string({ required_error: 'message is required' }).optional(),
        time: zodEnum([AlertMessageTime.NEW, AlertMessageTime.YESTERDAY, AlertMessageTime.EARLIER], {
            required_error: 'time is required',
            invalid_type_error: 'Invalid time value'
        }).default(AlertMessageTime.NEW).optional(),
        isRead: boolean().optional(),
        user: string({ required_error: 'user is required' }).optional(),
        createdAt: date().optional(),
    })
});

export type CreateAlertMeassgeInput = TypeOf<typeof createAlertMeassgeSchema>["body"]; 