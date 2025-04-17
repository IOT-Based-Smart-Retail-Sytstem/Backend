import ProductModel, {Product} from "../../models/user/product.model";
import { Request } from "express";
import { CustomError } from "../../utils/custom.error";
import CategoryModel from "../../models/user/category.model";
import { Types } from "mongoose";


export async function createProduct(input: Partial<Product>) {
  try {
    if (!input.categoryId || !Types.ObjectId.isValid(input.categoryId)) {
      throw new CustomError("Invalid category ID format", 400);
    }
    if (!input.subCategoryId || !Types.ObjectId.isValid(input.subCategoryId)) {
      throw new CustomError("Invalid subcategory ID format", 400);
    }

    const category = await CategoryModel.findById(input.categoryId).exec();
    if (!category) throw new CustomError("Category not found", 404);
    const subCategory = await CategoryModel.findById(input.subCategoryId).exec();
    if (!subCategory) throw new CustomError("Sub category not found", 404);
    return ProductModel.create(input);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllProducts(req: Request) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    return ProductModel.find().skip(skip).limit(limit).exec();
  } catch (error) {
    throw error;
  }
}

export async function getProductById(productId: string) {
  try {
    const product = await ProductModel.findById(productId).exec();
    if (!product) throw new CustomError("Product not found", 404);
    return product;
  } catch (error) {
    throw error;
  }
}

export async function getBestSellingProducts(id: string) {
  try {
    const product1 = await ProductModel.find({ categoryId: id })
      .sort({ sold: -1 })
      .limit(10)
      .exec();

    const product2 = await ProductModel.find({ subCategoryId: id })
      .sort({ sold: -1 })
      .limit(10)
      .exec();
    return product1 || product2;
  } catch (error) {
    throw error;
  }
}