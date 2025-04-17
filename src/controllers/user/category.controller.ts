import { Request, Response, NextFunction } from "express";
import getSubCategories, { createMainCategory, createSubCategory, getMainCategories, getSubCategoriesByParentId, updateCategory} from "../../service/user/category.service";
import {getBestSellingProducts} from "../../service/user/product.service";
import {CreateCategoryInput, UpdateCategoryInput, GetCategoryInput, GetSubCategoriesInput, GetMainCategoriesInput} from "../../schema/user/category.schema";

export async function createMainCategoryHandler(req: Request<{}, {}, CreateCategoryInput>, res: Response, next: NextFunction) {
    try {
        const body = req.body;
        const category = await createMainCategory(body);
        res.status(201).json({
            success: true,
            message: "Main category created successfully",
            data: category
        })
    } catch (e: any) {
        next(e);
    }
}

export async function createSubCategoryHandler(req: Request<{ parentId: string }, {}, CreateCategoryInput>, res: Response, next: NextFunction) {
    try {
        const body = req.body;
        const parentId = req.params.parentId;
        const category = await createSubCategory(body, parentId);
        res.status(201).json({
            success: true,
            message: "Subcategory created successfully",
            data: category
        })
    } catch (e: any) {
        next(e);
    }
}

export async function getSubCategoriesHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const subCategories = await getSubCategories();
        res.status(200).json({
            success: true,
            message: "Subcategories fetched successfully",
            data: subCategories
        })
    }
    catch (e: any) {
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

export async function updateCategoryHandler(req: Request<{ id: string }, {}, UpdateCategoryInput>, res: Response, next: NextFunction) {
    const categoryId = req.params.id;
    const body = req.body;
    try {
        const category = await updateCategory(categoryId, body);
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        })
    } catch (e: any) {
        next(e);
    }
}