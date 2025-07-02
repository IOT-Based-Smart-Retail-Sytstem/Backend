import express from 'express';
import { createProductHandler, getAllProductsHandler, getProductHandler, getProductsByCategoryHandler, getProductsBySubCategoryHandler, searchForProductHandler, getProductStateCountsHandler, updateProductHandler, getProductByBarcodeHandler , deleteProductHandler, restockProductHandler } from '../controllers/product.controller';
import { createProductSchema, updateProductSchema } from '../schema/user/product.schema';
import { getRecommendationsHandler } from '../controllers/recommendation.controller';
import validateResource from '../middlware/validateResource';

const router = express.Router();

router.post(
    "/api/product",
    validateResource(createProductSchema),
    createProductHandler
);

router.get(
    "/api/product",
    getAllProductsHandler
);

router.get(
    "/api/product/states/count",
    getProductStateCountsHandler
);

router.get(
    "/api/product/:id",
    getProductHandler
);

router.get(
    "/api/product/category/:id",
    getProductsByCategoryHandler
);

router.get(
    "/api/product/subcategory/:id",
    getProductsBySubCategoryHandler
);

router.get(
    "/api/product/search/:search",
    searchForProductHandler
);

router.put(
    "/api/product/:id",
    validateResource(updateProductSchema),
    updateProductHandler
);

router.put(
    "/api/product/:id/restock",
    restockProductHandler
);

router.delete(
    "/api/product/:id",
    deleteProductHandler
);
router.get(
    "/api/product/barcode/:barcode",
    getProductByBarcodeHandler
);

router.get('/api/products/:id/recommendations', getRecommendationsHandler);

export default router;