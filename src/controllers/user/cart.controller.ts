import { Request, Response } from "express";
import { CreateCartInput } from "../../schema/user/cart.schema";
import { createCart } from "../../service/user/cart.service";
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
