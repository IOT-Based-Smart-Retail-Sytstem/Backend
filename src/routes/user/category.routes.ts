import express from 'express';
import { createMainCategoryHandler, createSubCategoryHandler, getMainCategoriesHandler, getMainCategoryHandler, getSubCategoriesHandler, updateCategoryHandler } from '../../controllers/user/category.controller';
import { createCategorySchema, updateCategorySchema, getCategorySchema, getMainCategoriesSchema, getSubCategoriesSchema } from '../../schema/user/category.schema';
import validateResource from '../../middlware/validateResource';

const router = express.Router();
router.post('/api/category', validateResource(createCategorySchema), createMainCategoryHandler);
router.post('/api/category/:parentId', validateResource(createCategorySchema), createSubCategoryHandler);
router.get('/api/category', validateResource(getMainCategoriesSchema), getMainCategoriesHandler);
router.get('/api/category/sub', validateResource(getSubCategoriesSchema), getSubCategoriesHandler);
router.get('/api/category/:id', validateResource(getCategorySchema), getMainCategoryHandler);
router.put('/api/category/:id', validateResource(updateCategorySchema), updateCategoryHandler);

export default router;