import { getModelForClass, prop } from "@typegoose/typegoose";

// add date and time to the contact form
export class Contact {
    @prop({required : true })
    firstName : string

    @prop({required : true })
    lastName : string

    @prop({required : true })
    email : string

    @prop({required : true })
    phone : string

    @prop({required : true })
    message : string

    @prop({required : false , default : Date.now })
    createdAt : Date
}

const ContactModel = getModelForClass(Contact);

export default ContactModel;