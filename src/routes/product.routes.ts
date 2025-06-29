import express from 'express';
import { createProductHandler, getAllProductsHandler, getProductHandler, getProductsByCategoryHandler, getProductsBySubCategoryHandler, searchForProductHandler, getProductStateCountsHandler } from '../controllers/product.controller';
import { createProductSchema } from '../schema/user/product.schema';
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

export default router;