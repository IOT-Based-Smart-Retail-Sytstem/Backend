// models/adminEmail.model.ts
import { getModelForClass, prop } from "@typegoose/typegoose";

class AdminEmail {
  @prop({ required: true, unique: true })
  email!: string;
}

export const AdminEmails = getModelForClass(AdminEmail);
