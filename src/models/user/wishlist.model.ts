import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { Product } from "./product.model";

export class Wishlist {
    @prop({ required: true })
    userId: string;

    @prop({ type: () => [Product], ref: "Product" })
    products: Ref<Product>[];
}
const WishlistModel = getModelForClass(Wishlist);
export default WishlistModel;