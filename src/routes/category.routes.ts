import express from 'express';
import { createCategoryHandler, getMainCategoriesHandler, getMainCategoryHandler } from '../controllers/category.controller';


const router = express.Router();
router.post('/api/category', createCategoryHandler);
router.post('/api/category/:parentId', createCategoryHandler);
router.get('/api/category', getMainCategoriesHandler);
router.get('/api/category/:id', getMainCategoryHandler);

export default router;