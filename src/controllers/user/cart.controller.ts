import { Request, Response } from "express";
import { AddToCartInput, CreateCartInput } from "../../schema/user/cart.schema";
import { createCart, updateCart } from "../../service/user/cart.service";
import { Code, Status } from "../../utils/httpStatus";

export const createCartHandler = async (req: Request<{}, {}, CreateCartInput>, res: Response) => {
  const { qrCode } = req.body;
  try {
    const cart = await createCart(qrCode);
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


export const updateCarttHandler = async (req: Request<{}, {}, AddToCartInput>, res: Response) => {
  const { productId, quantity } = req.body;
  const userId = res.locals.user._id; // Assuming the user is authenticated and the user ID is available in res.locals
  try {
    const cart = await updateCart(userId, productId, quantity);
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
