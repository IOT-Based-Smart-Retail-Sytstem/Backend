import CartModel from "../models/cart.model";
import UserModel from "../models/user.model";
import { CustomError } from "../utils/custom.error";
import { Code } from "../utils/httpStatus";
import { Product } from '../models/product.model';
import type { DocumentType } from '@typegoose/typegoose';


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
    if(cart.isActive && cart.user?._id.toString() !== userId){
      throw new CustomError('Cart is already active', Code.BadRequest);
    }
    cart.user = user;
    cart.isActive = true;
    await cart.save();
    return cart;
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
export async function updateCart(
  userId: string,
  product: DocumentType<Product>,
  quantity: number
) {
  try {
    const cart = await getUserCart(userId);
    // console.log("cart before updateCart", cart)
      const itemIndex = cart.items.findIndex(
        (item) => item.product._id.toString() === product._id.toString()
      );

      if (itemIndex > -1) {
        // Update existing item quantity
        cart.items[itemIndex].quantity += quantity;
        console.log("cart.items[itemIndex].quantity", cart.items[itemIndex].quantity)
        if(cart.items[itemIndex].quantity === 0){
          cart.items.splice(itemIndex, 1);
        }
      } else {
        // Add new item only if it doesn't exist
        cart.items.push({
          product: product._id,
          quantity
        });
      }

      // Recalculate total price based on all items
      cart.totalPrice += product.price * quantity;
      console.log("cart in updateCart", cart)
      await cart.save();
      return cart;
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Failed to add product to cart', Code.InternalServerError);
  }
}

/**
 * Clears a user's cart (removes all items and resets total)
 * @param userId - The ID of the user
 * @returns The cleared cart
 */
export async function clearCart(userId: string) {
  try {
    const cart = await getUserCart(userId);
    
    // Clear all items and reset total
    cart.items = [];
    cart.totalPrice = 0;
    cart.isActive = false;
    
    await cart.save();
    
    return cart;
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Failed to clear cart', Code.InternalServerError);
  }
}

/**
 * Clears a cart by its ID (for webhook usage)
 * @param cartId - The ID of the cart to clear
 * @returns The cleared cart
 */
export async function clearCartById(cartId: string) {
  try {
    const cart = await CartModel.findById(cartId);
    
    if (!cart) {
      throw new CustomError('Cart not found', Code.NotFound);
    }
    
    // Clear all items and reset total
    cart.items = [];
    cart.totalPrice = 0;
    cart.isActive = false;
    cart.user = null;
    
    await cart.save();
    
    return cart;
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Failed to clear cart', Code.InternalServerError);
  }
}