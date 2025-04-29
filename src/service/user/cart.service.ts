import { Types } from "mongoose";
import CartModel, { Cart } from "../../models/user/cart.model";
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
export async function connectUserToCart(userId: string, cartQrCode: string) {
  try {
    console.log("cartQrCode", cartQrCode)
    console.log("userId", userId)
    const cart = await CartModel.findOne({qrCode: cartQrCode});
    console.log("cart", cart)
    if (!cart) {
      throw new CustomError('Cart not found', Code.NotFound);
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new CustomError('User not found', Code.NotFound);
    }
    cart.user = user;
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
export async function addToCart(userId: string, productId: string, quantity: number){
  try {
      const product = await getProductById(productId);
      const cart = await getCart(userId);

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

/**
 * Removes a product from the user's cart
 * @param userId - The ID of the user
 * @param productId - The ID of the product to remove
 * @returns The updated cart
 */
export async function removeFromCart(userId: string, productId: string) {
  try {
    const product = await getProductById(productId);
    const cart = await getCart(userId);

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex === -1) {
        throw new CustomError("Item not found in cart", Code.NotFound);
      }

      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity--;
      } else {
        cart.items.splice(itemIndex, 1);
      }

      cart.totalPrice -= product.price;
      await cart.save();
    return cart!;
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Failed to remove product from cart', Code.InternalServerError);
  }
}