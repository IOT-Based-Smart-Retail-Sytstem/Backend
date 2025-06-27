import express from "express";
import {createCartHandler, clearCartHandler} from "../controllers/cart.controller";
import {createCartSchema} from "../schema/user/cart.schema";
import validateResource from '../middlware/validateResource';

const router = express.Router();

// إنشاء عربة تسوق جديدة
router.post("/api/cart", validateResource(createCartSchema), createCartHandler);

// // إضافة منتج إلى العربة
// router.post("/api/cart/add", validateResource(addToCartSchema), addToCartHandler);

// // الحصول على محتويات العربة
// router.get("/api/cart/:userId", validateResource(getCartSchema), getCartHandler);

// Clear cart route
router.delete('/clear/:userId', clearCartHandler);
router.delete('/clear', clearCartHandler);

// // حذف منتج من العربة
// router.delete("/:productId", validateResource(removeFromCartSchema), removeFromCartHandler);

export default router;