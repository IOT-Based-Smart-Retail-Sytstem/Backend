import express from 'express';
import { createProductHandler, getAllProductsHandler, getProductHandler } from '../controllers/product.controller';
import { createProductSchema } from '../schema/product.schema';
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
    "/api/product/:id",
    getProductHandler
);

export default router;