import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import {object, string, TypeOf} from 'zod'

export const contactSchema = object({
    body: object({
        firstName: string({required_error: 'First name is required'}),
        lastName: string({required_error: 'Last name is required'}),
        email: string({required_error: 'Email is required'}).email({message: 'Not a valid email'}),
        phone: string({required_error: 'Phone is required'}),
        message: string({required_error: 'Message is required'}),
    })
})

export type ContactInput = TypeOf<typeof contactSchema>['body']