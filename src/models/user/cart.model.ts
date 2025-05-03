import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { Product } from "./product.model";
import { User } from "./user.model";

export class CartItem {
  @prop({ ref: () => Product, required: true })
  product: Ref<Product>; // Ref to Product

  @prop({ required: true, default: 1 })
  quantity: number;
}

export class Cart {
  @prop({ required: true, default: 0, unique: true })
  qrCode: string;
  
  @prop({ ref: () => User, required: false })
  user: Ref<User> | null;

  @prop({ type: () => [CartItem], default: [] })
  items: CartItem[];
  
  @prop({ required: false, default: 0 })
  totalPrice: number;

  @prop({ required: false, default: false })
  isActive: boolean;
}

const CartModel = getModelForClass(Cart);

export default CartModel;