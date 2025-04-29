import express from "express";
import {
  addToCartHandler,
  removeFromCartHandler,
  createCartHandler,
  getCartHandler,
} from "../../controllers/user/cart.controller";
import {
  addToCartSchema,
  removeFromCartSchema,
  getCartSchema,
  createCartSchema,
} from "../../schema/user/cart.schema";
import validateResource from '../../middlware/validateResource';

const router = express.Router();

// إنشاء عربة تسوق جديدة
router.post("/api/cart", createCartHandler);

// // إضافة منتج إلى العربة
// router.post("/api/cart/add", validateResource(addToCartSchema), addToCartHandler);

// // الحصول على محتويات العربة
// router.get("/api/cart/:userId", validateResource(getCartSchema), getCartHandler);


// // حذف منتج من العربة
// router.delete("/:productId", validateResource(removeFromCartSchema), removeFromCartHandler);

export default router;