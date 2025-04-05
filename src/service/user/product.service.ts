import ProductModel, {Product} from "../../models/user/product.model";
import { Request } from "express";

export async function createProduct(input: Partial<Product>) {
  return ProductModel.create(input);
}

export async function getAllProducts(req: Request) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  return ProductModel.find().skip(skip).limit(limit).exec();
}

export async function getProductById(productId: string) {
  return ProductModel
    .findById(productId)
    .exec();
}

export async function getBestSellingProducts(id: string) {
  const product1 = await ProductModel.find({ categoryId: id })
    .sort({ sold: -1 })
    .limit(10)
    .exec();

  const product2 = await ProductModel.find({ subCategoryId: id })
    .sort({ sold: -1 })
    .limit(10)
    .exec();
  return  product1 || product2;
}