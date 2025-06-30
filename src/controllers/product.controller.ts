import { Request, Response, NextFunction } from "express";
import { createProduct, getAllProducts, getProductById, getProductsByCategory, getProductsBySubCategory, searchForProduct, getProductStateCounts, updateProduct } from "../service/product.service";
import { UpdateProductInput } from "../schema/user/product.schema";

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

export async function searchForProductHandler(req: Request, res: Response) {
    try {
        const { search } = req.params;
        const products = await searchForProduct(search);
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}

export async function getProductStateCountsHandler(req: Request, res: Response) {
    try {
        const stateCounts = await getProductStateCounts();
        res.status(200).json({
            success: true,
            data: stateCounts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}

export async function updateProductHandler(req: Request<{ id: string }, {}, UpdateProductInput>, res: Response, next: NextFunction) {
    const productId = req.params.id;
    const body = req.body;
    try {
        const product = await updateProduct(productId, body);
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (e) {
        next(e);
    }
}

        