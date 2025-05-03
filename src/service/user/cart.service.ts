import { Types } from "mongoose";
import CartModel from "../../models/user/cart.model";
import UserModel from "../../models/user/user.model";
import { getProductById } from "./product.service";
import { CustomError } from "../../utils/custom.error";
import { Code } from "../../utils/httpStatus";


/**
 * Creates a new cart with the specified QR code
 * @param qrCode - The QR code to associate with the cart
 * @returns The created cart
 */
export async function createCart(qrCode: string) {
  try {
    const cart = await CartModel.create({qrCode});
    return cart;
  } catch (error) {
    console.log("error", error)
    throw error;
  }
}

/**
 * Retrieves a cart for a specific user
 * @param userId - The ID of the user
 * @returns The user's cart
 */
export async function getUserCart(userId: string) {
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
 * Retrieves a cart by its QR code
 * @param qrCode - The QR code of the cart
 * @returns The cart
 */
export async function getCartByQrCode(qrCode: string) {
  try {
    const cart = await CartModel.findOne({ qrCode })
      .populate("items.product")
      .exec();

    if (!cart) {
      throw new CustomError('Cart not found', Code.NotFound);
    }
    return cart;
  } catch (error) {
    throw error;
  }
}
/**
 * Connects a user to a cart using a QR code
 * @param userId - The ID of the user
 * @param qrCode - The QR code of the cart
 * @returns The updated cart
 */
export async function connectUserToCart(userId: string, cartQrCode: string) {
  try {
    const cart = await getCartByQrCode(cartQrCode);
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new CustomError('User not found', Code.NotFound);
    }
    if(cart.isActive){
      throw new CustomError('Cart is already active', Code.BadRequest);
    }
    cart.user = user;
    cart.isActive = true;
    console.log("cart from service", cart)
    await cart.save();
    return cart!;
  } catch (error) {
    throw error;
  }
}

/**
 * Adds a product to the user's cart
 * @param userId - The ID of the user
 * @param productId - The ID of the product to add
 * @param quantity - The quantity of the product to add
 * @returns The updated cart
 */
export async function updateCart(userId: string, productId: string, quantity: number){
  try {
      const product = await getProductById(productId);
      const cart = await getUserCart(userId);

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({
          product: new Types.ObjectId(productId),
          quantity
        });
      }
      cart.totalPrice += product.price * quantity;
      await cart.save();
      return cart!;
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Failed to add product to cart', Code.InternalServerError);
  }
}