import WishlistModel from "../../models/user/wishlist.model";
import { CustomError } from "../../utils/custom.error";
import { findUserById } from "./user.service";
import {getProductById} from "./product.service";
import c from "config";
import { Wishlist } from '../../models/user/wishlist.model';


export async function createWishlist(userId: string) {
    const wishlist = new WishlistModel({ userId, products: [] });
    await wishlist.save();
    return wishlist;
}

export async function addToWishlist(userId: string, productId: string) {
    const user = await findUserById(userId);
    const product = await getProductById(productId);

    let wishlist = await WishlistModel.findOne({ userId });
    if (!wishlist)  wishlist = await createWishlist(userId);
    else {
        const productExists = wishlist.products.find((item) => item._id.toString() === productId);
        if (productExists) {
            throw new CustomError("Product already in wishlist", 400);
        }
    }
    wishlist.products.push(product);
    await wishlist.save();
}

export async function removeFromWishlist(userId: string, productId: string) {
    const user = await findUserById(userId);
    const product = await getProductById(productId);
    
    const wishlist = await WishlistModel.deleteOne({ userId, products: { $elemMatch: { _id: productId } } });
    if (!wishlist) {
        throw new CustomError("Product not found in wishlist", 404);
    }
    return wishlist;
}

export async function getWishlist(userId: string) {
    const user = await findUserById(userId);

    const wishlist = await WishlistModel.findOne({ userId }).populate("products");
    if (!wishlist) {
        throw new CustomError("Wishlist not found", 404);
    }
    return wishlist;
}