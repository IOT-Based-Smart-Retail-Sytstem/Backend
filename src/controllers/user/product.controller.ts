import { Request, Response, NextFunction } from "express";
import { createProduct, getAllProducts, getProductById, getProductsByCategory, getProductsBySubCategory, searchForProduct } from "../../service/user/product.service";

export async function createProductHandler(req: Request, res: Response, next: NextFunction) {
    const body = req.body;
    try {
        console.log("body", body);
        const product = await createProduct(body);
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        })
    } catch (e: any) {
        next(e);
    }
}

export async function getProductHandler(req: Request, res: Response, next: NextFunction) {
    const productId = req.params.id;
    try {
        const product = await getProductById(productId);
        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product
        })
    } catch (e: any) {
        next(e);
    }
}

export async function getAllProductsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const products = await getAllProducts(req);
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products
        })
    } catch (e: any) {
        next(e);
    }
}

export async function getProductsByCategoryHandler(req: Request, res: Response, next: NextFunction) {
    const categoryId = req.params.id;
    try {
        const products = await getProductsByCategory(categoryId);
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products
        })
    } catch (e: any) {
        next(e);
    }
}

export async function getProductsBySubCategoryHandler(req: Request, res: Response, next: NextFunction) {
    const subCategoryId = req.params.id;
    try {
        const products = await getProductsBySubCategory(subCategoryId);
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products
        })
    } catch (e: any) {
        next(e);
    }
}

export async function searchForProductHandler(req: Request, res: Response, next: NextFunction) {
    const search = req.params.search;
    try {
        const products = await searchForProduct(search);
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products
        })
    } catch (e: any) {
        next(e);
    }
}

        