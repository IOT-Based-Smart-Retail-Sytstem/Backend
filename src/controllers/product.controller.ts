import { Request, Response, NextFunction } from "express";
import { createProduct, getAllProducts, getProductById, getProductsByCategory, getProductsBySubCategory, searchForProduct, getProductStateCounts, updateProduct, getProductByBarcode ,  deleteProductById } from "../service/product.service";
import { UpdateProductInput } from "../schema/user/product.schema";
import { sendInventoryAlert, sendLowStockAlert, sendRestockNotification } from '../service/notification-integration.service';

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
        const { page, limit, ...filters } = req.query;
        const products = await getAllProducts({ page: parseInt(page as string), limit: parseInt(limit as string), ...filters });
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

export async function getProductByBarcodeHandler(req: Request, res: Response, next: NextFunction) {
    const barcode = req.params.barcode;
    try {
        const product = await getProductByBarcode(barcode);
        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product
        })
    } catch (e: any) {
        next(e);
    }
}

export async function updateProductHandler(req: Request<{ id: string }, {}, UpdateProductInput>, res: Response, next: NextFunction) {
    const productId = req.params.id;
    const body = req.body;
    try {
        const oldProduct = await getProductById(productId);
        const product = await updateProduct(productId, body);
        
        const adminUserId = 'ADMIN_USER_ID';
        
        // Check if stock reached 0 (out of stock)
        if (oldProduct && oldProduct.stock > 0 && product.stock === 0) {
            await sendInventoryAlert(adminUserId, product.title);
        }
        
        // Check if stock is low (less than 10)
        if (oldProduct && oldProduct.stock >= 10 && product.stock < 10 && product.stock > 0) {
            await sendLowStockAlert(adminUserId, product.title, product.stock);
        }
        
        // Check if product was restocked (stock increased)
        if (oldProduct && oldProduct.stock < product.stock) {
            await sendRestockNotification(adminUserId, product.title, product.stock);
        }
        
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (e) {
        next(e);
    }
}

export async function deleteProductHandler(req: Request, res: Response, next: NextFunction) {
    const productId = req.params.id;
    try {
        const product = await deleteProductById(productId);
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: product
        });
    } catch (e: any) {
        next(e);
    }
}
  