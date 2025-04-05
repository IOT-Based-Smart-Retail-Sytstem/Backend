import { Request, Response, NextFunction } from "express";
import { createCategory, getMainCategories, getSubCategoriesByParentId } from "../service/category.service";
import {getBestSellingProducts} from "../service/product.service";

export async function createCategoryHandler(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    const parentId = req.params.parentId;
    try {
        console.log("parentId", parentId);
        const category = await createCategory(body, parentId || undefined);
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        })
    } catch (e: any) {
        next(e);
    }
}

export async function getMainCategoriesHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const categories = await getMainCategories();
        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories
        })
    } catch (e: any) {
        next(e);
    }
}

export async function getMainCategoryHandler(req: Request, res: Response, next: NextFunction) {
    const categoryId = req.params.id;
    try {
        const subCategories = await getSubCategoriesByParentId(categoryId);
        const bestSeller = await getBestSellingProducts(categoryId);
        const bestFirstSubCategorySellers = await getBestSellingProducts(subCategories[0]._id.toString());
        res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: {
                subCategories,
                bestSeller,
                bestFirstSubCategorySellers
            },
        });
    } catch (e: any) {
        next(e);
    }
}