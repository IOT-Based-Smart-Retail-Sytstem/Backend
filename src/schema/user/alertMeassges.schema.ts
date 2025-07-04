import { object, string, boolean, TypeOf, enum as zodEnum } from "zod";
import { AlertMessageTime } from "../../models/alertMeassges.model";

export const createAlertMeassgeSchema = object({
    body: object({
        title: string({ required_error: 'title is required' }),
        message: string({ required_error: 'message is required' }),
        time: zodEnum([AlertMessageTime.NEW, AlertMessageTime.YESTERDAY, AlertMessageTime.EARLIER], {
            required_error: 'time is required',
            invalid_type_error: 'Invalid time value'
        }).default(AlertMessageTime.NEW),
        isRead: boolean().optional(),
        userId: string({ required_error: 'userId is required' })
    })
});

export type CreateAlertMeassgeInput = TypeOf<typeof createAlertMeassgeSchema>["body"]; 