import ProductModel, {Product} from "../models/product.model";
import { Request } from "express";
import { CustomError } from "../utils/custom.error";
import CategoryModel from "../models/category.model";

export async function updateProductState(productId: string, state: string) {
    try {
        const product = await ProductModel.findByIdAndUpdate(
            productId,
            { state },
            { new: true }
        );
        
        if (!product) {
            throw new Error('Product not found');
        }
        
        return product;
    } catch (error) {
        throw error;
    }
}

export async function createProduct(input: Partial<Product>) {
  try {
    const category = await CategoryModel.findOne({name: {$regex: input.categoryId, $options: "i"}}).exec();
    if (!category) throw new CustomError("Category not found", 404);
    input.categoryId = category._id.toString();

    const subCategory = await CategoryModel.findOne({name: {$regex: input.subCategoryId, $options: "i"}}).exec();
    if (!subCategory) throw new CustomError("Sub category not found", 404);
    input.subCategoryId = subCategory._id.toString();
    return ProductModel.create(input);
  } catch (error) {
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

export async function getProductByBarcode(barcode: string) {
  try {
    const product = await ProductModel.findOne({ barcode: barcode }).exec();
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

export async function getProductsByCategory(categoryId: string) {
  try {
    const products = await ProductModel.find({ categoryId: categoryId }).exec();
    return products;
  } catch (error) {
    throw error;
  }
}

export async function getProductsBySubCategory(subCategoryId: string) {
  try {
    const products = await ProductModel.find({ subCategoryId: subCategoryId }).exec();
    return products;
  } catch (error) {
    throw error;
  }
}

export async function searchForProduct(search: string) {
  try {
    const products = await ProductModel.find({ title: { $regex: search, $options: "i" } }).exec();
    return products;
  } catch (error) {
    throw error;
  }
}
