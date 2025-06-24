import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./user.model";
import { Product } from "./product.model";

class OrderItem {
  @prop({ ref: () => Product, required: true })
  product!: Ref<Product>;

  @prop({ required: true })
  quantity!: number;

  @prop({ required: true })
  price!: number;

  @prop({ required: true })
  scannedAt!: Date;
}

export class Order {
  @prop({ ref: () => User, required: true })
  user!: Ref<User>;

  @prop({ type: () => [OrderItem], required: true })
  items!: OrderItem[];

  @prop({ required: true })
  totalPrice!: number;

  @prop({ default: 'completed' })
  status!: string; // completed, cancelled, refunded

  @prop({ required: true })
  paymentMethod!: string; // stripe, cash, etc.

  @prop()
  paymentIntentId?: string; // Stripe payment intent ID

  @prop({ required: true })
  storeLocation!: string; // Which store/checkout area

  @prop({ default: Date.now })
  createdAt?: Date;

  @prop({ default: Date.now })
  updatedAt?: Date;
}

export const OrderModel = getModelForClass(Order, {
  schemaOptions: {
    timestamps: true,
  },
});