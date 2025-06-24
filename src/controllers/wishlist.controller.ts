import { Request, Response, NextFunction } from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../service/wishlist.service";


export async function addToWishlistHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, productId } = req.params;
        const wishlist = await addToWishlist(userId, productId);
        res.status(201).json({
            success: true,
            message: "Product added to wishlist successfully",
            wishlist,
        });
        
    } catch (e: any) {
        next(e);
    }
}

export async function getWishlistHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.params;
        const wishlist = await getWishlist(userId);
        res.status(200).json({
            success: true,
            message: "Wishlist fetched successfully",
            wishlist,
        });
    } catch (e: any) {
        next(e);
    }
}

export async function deleteFromWishlistHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, productId } = req.params;
        const wishlist = await removeFromWishlist(userId, productId);
        res.status(200).json({
            success: true,
            message: "Product removed from wishlist successfully",
            wishlist,
        });
    } catch (e: any) {
        next(e);
    }
}