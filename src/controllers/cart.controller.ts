import { Request, Response } from "express";
import { AddToCartInput, UpdateCartItemInput, RemoveFromCartInput, GetCartInput, CreateCartInput } from "../schema/cart.schema";
import { createCart, getCart, addToCart, updateCartItem, removeFromCart } from "../service/cart.service";
import { Code, Status } from "../utils/httpStatus";

export const createCartHandler = async (req: Request<{}, {}, CreateCartInput>, res: Response) => {
  const { userId } = req.body;
  try {
    const cart = await createCart(userId);
    res.status(Code.Created).json({
      status: Status.SUCCESS,
      data: cart,
    });
  } catch (e: any) {
    res.status(Code.BadRequest).json({
      status: Status.FAIL,
      message: e.message,
    });
  }
};

export const getCartHandler = async (req: Request<GetCartInput>, res: Response) => {
  const { userId } = req.params;
  try {
    const cart = await getCart(userId);
    res.status(Code.OK).json({
      status: Status.SUCCESS,
      data: cart,
    });
  } catch (e: any) {
    res.status(Code.NotFound).json({
      status: Status.FAIL,
      message: e.message,
    });
  }
};

export const addToCartHandler = async (req: Request<{}, {}, AddToCartInput>, res: Response) => {
  const { productId, quantity } = req.body;
  const userId = res.locals.user._id; // Assuming the user is authenticated and the user ID is available in res.locals
  try {
    const cart = await addToCart(userId, productId, quantity);
    res.status(Code.OK).json({
      status: Status.SUCCESS,
      data: cart,
    });
  } catch (e: any) {
    res.status(Code.BadRequest).json({
      status: Status.FAIL,
      message: e.message,
    });
  }
};

export const updateCartItemHandler = async (req: Request<{ productId: string }, {}, UpdateCartItemInput>, res: Response) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = res.locals.user._id;
  try {
    const cart = await updateCartItem(userId, productId, quantity);
    res.status(Code.OK).json({
      status: Status.SUCCESS,
      data: cart,
    });
  } catch (e: any) {
    res.status(Code.BadRequest).json({
      status: Status.FAIL,
      message: e.message,
    });
  }
};

export const removeFromCartHandler = async (req: Request<RemoveFromCartInput>, res: Response) => {
  const { productId } = req.params;
  const userId = res.locals.user._id;
  try {
    const cart = await removeFromCart(userId, productId);
    res.status(Code.OK).json({
      status: Status.SUCCESS,
      data: cart,
    });
  } catch (e: any) {
    res.status(Code.BadRequest).json({
      status: Status.FAIL,
      message: e.message,
    });
  }
};