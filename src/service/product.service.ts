import ProductModel, {Product, ProductState} from "../models/product.model";
import { CustomError } from "../utils/custom.error";
import CategoryModel from "../models/category.model";
import { getCategoryById } from "./category.service";
function calculateStockState(stock: number): ProductState {
    if (stock === 0) return ProductState.OUT;
    if (stock > 0 && stock < 50) return ProductState.LOW;
    if (stock >= 50) return ProductState.AVAILABLE;
    return ProductState.OUT;
}

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

    if (typeof input.stock === 'number') {
      input.stockState = calculateStockState(input.stock);
    }
    return ProductModel.create(input);
  } catch (error) {
    throw error;
  }
}

export async function getAllProducts(filters: { page?: number, limit?: number, [key: string]: any }) {
  try {
    const { page, limit, ...mongoFilters } = filters;

    let query = ProductModel.find(mongoFilters);

    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const products = await query.exec();
    console.log(products.length);

    // Fetch category and subcategory names for each product
    const productsWithCategories = await Promise.all(
      products.map(async (product) => {
        const category = await CategoryModel.findById(product.categoryId).exec();
        const subCategory = await CategoryModel.findById(product.subCategoryId).exec();
        return {
          ...product.toObject(),
          categories: category?.name || 'Unknown Category',
          subCategoryName: subCategory?.name || 'Unknown Subcategory'
        };
      })
    );

    // Only count total if paginated (optional, for performance)
    const total = await ProductModel.countDocuments(mongoFilters);

    return {
      products: productsWithCategories,
      total,
      page: page || 1,
      limit: limit || products.length // If not paginated, limit is all products
    };
  } catch (error) {
    throw error;
  }
}

export async function getProductById(productId: string) {
  try {
    const product = await ProductModel.findById(productId).exec();
    if (!product) throw new CustomError("Product not found", 404);
    return {
      ...product.toObject(),
      category: await getCategoryById(product.categoryId),
      subCategory: await getCategoryById(product.subCategoryId)
    }
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

export async function getProductStateCounts() {
  try {
    const counts = await ProductModel.aggregate([
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize default counts
    const stateCounts = {
      available: 0,
      out: 0,
      low: 0,
      total: 0
    };

    // Map the aggregation results to our desired format
    counts.forEach(item => {
      if (item._id in stateCounts) {
        stateCounts[item._id as keyof typeof stateCounts] = item.count;
      }
    });

    // Calculate total
    stateCounts.total = stateCounts.available + stateCounts.out + stateCounts.low;

    return stateCounts;
  } catch (error) {
    throw error;
  }
}

export async function updateProduct(productId: string, input: Partial<Product>) {
  try {
    // Convert category and subCategory names to IDs if present
    if (input.categoryId) {
      const category = await CategoryModel.findOne({ name: { $regex: input.categoryId, $options: "i" } }).exec();
      if (!category) throw new CustomError("Category not found", 404);
      input.categoryId = category._id.toString();
    }
    if (input.subCategoryId) {
      const subCategory = await CategoryModel.findOne({ name: { $regex: input.subCategoryId, $options: "i" } }).exec();
      if (!subCategory) throw new CustomError("Sub category not found", 404);
      input.subCategoryId = subCategory._id.toString();
    }
    if (typeof input.stock === 'number') {
      input.stockState = calculateStockState(input.stock);
    }
    const product = await ProductModel.findByIdAndUpdate(productId, input, { new: true });
    if (!product) throw new CustomError("Product not found", 404);
    return product;
  } catch (error) {
    throw error;
  }
}

export async function deleteProductById(productId: string) {
  try {
    const product = await ProductModel.findByIdAndDelete(productId).exec();
    if (!product) throw new CustomError("Product not found", 404);
    return product;
  } catch (error) {
    throw error;
  }
}