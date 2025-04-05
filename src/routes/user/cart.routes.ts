import express from "express";
import {
  addToCartHandler,
  getCartHandler,
  updateCartItemHandler,
  removeFromCartHandler,
  createCartHandler,
} from "../../controllers/user/cart.controller";
import {
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
  getCartSchema,
  createCartSchema,
} from "../../schema/user/cart.schema";
import validateResource from '../../middlware/validateResource';

const router = express.Router();

// إنشاء عربة تسوق جديدة
router.post("/", validateResource(createCartSchema), createCartHandler);

// إضافة منتج إلى العربة
router.post("/add", validateResource(addToCartSchema), addToCartHandler);

// الحصول على محتويات العربة
router.get("/:userId", validateResource(getCartSchema), getCartHandler);

// تحديث كمية منتج في العربة
router.put("/:productId", validateResource(updateCartItemSchema), updateCartItemHandler);

// حذف منتج من العربة
router.delete("/:productId", validateResource(removeFromCartSchema), removeFromCartHandler);

export default router;