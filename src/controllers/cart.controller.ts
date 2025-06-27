import { Request, Response } from "express";
import { CreateCartInput } from "../schema/user/cart.schema";
import { createCart } from "../service/cart.service";
import { Code, Status } from "../utils/httpStatus";
import { clearCart } from "../service/cart.service";
import { CustomError } from "../utils/custom.error";

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

export async function clearCartHandler(req: Request, res: Response) {
  try {
    const userId = req.body.userId || req.params.userId;

    if (!userId) {
      return res.status(Code.BadRequest).json({
        status: Status.FAIL,
        message: "User ID is required"
      });
    }

    const clearedCart = await clearCart(userId);

    return res.status(Code.OK).json({
      status: Status.SUCCESS,
      message: "Cart cleared successfully",
      data: {
        cartId: clearedCart._id,
        itemsCount: 0,
        totalPrice: 0
      }
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        status: Status.FAIL,
        message: error.message
      });
    }

    return res.status(Code.InternalServerError).json({
      status: Status.ERROR,
      message: "Failed to clear cart"
    });
  }
}
