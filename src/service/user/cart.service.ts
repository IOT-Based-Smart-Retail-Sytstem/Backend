import { Types, Document } from "mongoose";
import CartModel, { Cart } from "../../models/user/cart.model";
import UserModel from "../../models/user/user.model";
import { getProductById } from "./product.service";
import { CustomError } from "../../utils/custom.error";
import { Code } from "../../utils/httpStatus";

type CartWithId = Cart & Document;

/**
 * Creates a new cart with the specified QR code
 * @param qrCode - The QR code to associate with the cart
 * @returns The created cart
 */
export async function createCart(qrCode: string) {
  try {
    const cart = await CartModel.create({qrCode, items: []});
    return cart;
  } catch (error) {
    throw new CustomError('Failed to create cart', Code.InternalServerError);
  }
}

/**
 * Retrieves a cart for a specific user
 * @param userId - The ID of the user
 * @returns The user's cart
 */
export async function getCart(userId: string) {
  try {
    const cart = await CartModel.findOne({ user: userId })
      .populate("items.product")
      .exec();

    if (!cart) {
      throw new CustomError("Cart not found", Code.NotFound);
    }

    return cart;
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Failed to get cart', Code.InternalServerError);
  }
}

/**
 * Connects a user to a cart using a QR code
 * @param userId - The ID of the user
 * @param qrCode - The QR code of the cart
 * @returns The updated cart
 */
export async function connectUserToCart(userId: string, qrCode: string) {
  try {
    const session = await CartModel.startSession();
    let cart: CartWithId;
    await session.withTransaction(async () => {
      const [cartDoc, user] = await Promise.all([
        CartModel.findOne({ qrCode }).session(session),
        UserModel.findById(userId).session(session)
      ]);

      if (!cartDoc) {
        throw new CustomError("Cart not found", Code.NotFound);
      }
      else if(cartDoc.isActive){
        throw new CustomError("cart is not available right now", Code.Conflict);
      }
      if (!user) {
        throw new CustomError("User not found", Code.NotFound);
      }
      cartDoc.user = user;
      cartDoc.isActive = true;
      cart = await cartDoc.save({ session });
    });

    return cart!;
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Failed to connect user to cart', Code.InternalServerError);
  }
}

/**
 * Adds a product to the user's cart
 * @param userId - The ID of the user
 * @param productId - The ID of the product to add
 * @param quantity - The quantity of the product to add
 * @returns The updated cart
 */
export async function addToCart(userId: string, productId: string, quantity: number){
  try {

    const session = await CartModel.startSession();
    let cart: Cart & Document;

    await session.withTransaction(async () => {
      const [product, cartDoc] = await Promise.all([
        getProductById(productId),
        getCart(userId)
      ]);

      const itemIndex = cartDoc.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cartDoc.items[itemIndex].quantity += quantity;
      } else {
        cartDoc.items.push({
          product: new Types.ObjectId(productId),
          quantity
        });
      }

      cartDoc.totalPrice += product.price * quantity;
      cart = await cartDoc.save({ session });
    });

    return cart!;
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Failed to add product to cart', Code.InternalServerError);
  }
}

/**
 * Removes a product from the user's cart
 * @param userId - The ID of the user
 * @param productId - The ID of the product to remove
 * @returns The updated cart
 */
export async function removeFromCart(userId: string, productId: string) {
  try {

    const session = await CartModel.startSession();
    let cart: Cart;

    await session.withTransaction(async () => {
      const [product, cartDoc] = await Promise.all([
        getProductById(productId),
        getCart(userId)
      ]);

      if (!product) {
        throw new CustomError("Product not found", Code.NotFound);
      }

      const itemIndex = cartDoc.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex === -1) {
        throw new CustomError("Item not found in cart", Code.NotFound);
      }

      if (cartDoc.items[itemIndex].quantity > 1) {
        cartDoc.items[itemIndex].quantity--;
      } else {
        cartDoc.items.splice(itemIndex, 1);
      }

      cartDoc.totalPrice -= product.price;
      cart = await cartDoc.save({ session });
    });

    return cart!;
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Failed to remove product from cart', Code.InternalServerError);
  }
}