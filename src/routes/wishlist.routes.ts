import express from 'express';
import { getWishlistHandler, deleteFromWishlistHandler, addToWishlistHandler } from '../controllers/wishlist.controller';


const router = express.Router();

router.get(
    "/api/wishlist/:userId",
    getWishlistHandler
);

router.post(
    "/api/wishlist/:userId/:productId",
    addToWishlistHandler
);

router.delete(
    "/api/wishlist/:userId/:productId",
    deleteFromWishlistHandler
);
export default router;