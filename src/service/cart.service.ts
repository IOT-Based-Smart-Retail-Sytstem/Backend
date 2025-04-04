import { Types } from "mongoose"; 
import CartModel, { Cart, CartItem } from "../models/cart.model";
import ProductModel from "../models/product.model";
import  UserModel  from "../models/user.model";

export async function createCart(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const cart = await CartModel.create({ user: userId, items: [], totalPrice: 0 });
  return cart;
}

export async function getCart(userId: string) {
  const cart = await CartModel.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    throw new Error("Cart not found");
  }
  return cart;
}


export async function addToCart(userId: string, productId: string, quantity: number) {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
  
    let cart = await CartModel.findOne({ user: userId });
    if (!cart) {
      cart = await createCart(userId);
    }
  
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Use Types.ObjectId to create a valid reference
      cart.items.push({ product: new Types.ObjectId(productId), quantity });
    }
  
    cart.totalPrice += product.price * quantity;
    await cart.save();
  
    return cart;
}


export async function updateCartItem(userId: string, productId: string, quantity: number) {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex === -1) {
    throw new Error("Item not found in cart");
  }

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const oldQuantity = cart.items[itemIndex].quantity;
  cart.items[itemIndex].quantity = quantity;
  cart.totalPrice += product.price * (quantity - oldQuantity);

  await cart.save();
  return cart;
}

export async function removeFromCart(userId: string, productId: string) {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) {
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
  if (itemIndex === -1) {
    throw new Error("Item not found in cart");
  }

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const removedItem = cart.items.splice(itemIndex, 1)[0];
  cart.totalPrice -= product.price * removedItem.quantity;

  await cart.save();
  return cart;
}