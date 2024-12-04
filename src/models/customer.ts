import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose';
import { IsEmail, IsOptional, Length } from 'class-validator';
import 'reflect-metadata';

@modelOptions({
  schemaOptions: {
    timestamps: true, 
  },
})
@index({ email: 1 }, { unique: true }) 
export class User {
  @prop({ required: true, trim: true })
  public firstName!: string;

  @prop({ required: true, trim: true })
  public lastName!: string;

  @prop({ required: true, trim: true, lowercase: true, unique: true })
  @IsEmail({}, { message: 'Must be a valid email address' }) // Class-validator email validation
  public email!: string;

  @prop({ trim: true })
  @IsOptional() // Optional validation for phone number
  public phoneNumber?: string;

  @prop({ required: true })
  @Length(6, 50, { message: 'Password must be between 6 and 50 characters' }) // Class-validator length validation
  public password!: string;


  @prop({ default: false })
  public verified?: boolean;

  @prop({ default: '' })
  public token?: string;
}

// Create a Typegoose model
const UserModel = getModelForClass(User);
export default UserModel;
