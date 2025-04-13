import CategoryModel, {Category} from "../../models/user/category.model";
import { CustomError } from "../../utils/custom.error";

export async function createCategory(input: Partial<Category>, parentId?: string) {
    if (parentId) {
        const parentCategory = await CategoryModel.findById(parentId);
        if (!parentCategory) throw new CustomError("Parent category not found", 404);
        if (parentCategory.parent) throw new CustomError("Parent category is not a main category", 400);


        return CategoryModel.create({
            ...input,
            parent: parentCategory,
        });
    }
    // If no parentId is provided, create a main category
  return CategoryModel.create(input);
}


export async function getMainCategories() {
  return CategoryModel.find({ parent: null}, {parent: 0, __v: 0}).exec();
}


export async function getSubCategories() {
    return CategoryModel.find({ parent: { $ne: null } }, {parent: 0, __v: 0}).exec();
}


export async function getSubCategoriesByParentId(parentId: string) {
    const parentCategory = await CategoryModel.findById(parentId);
    if (!parentCategory) throw new CustomError("Parent category not found", 404);
    if (parentCategory.parent) throw new CustomError("Parent category is not a main category", 400);


  return CategoryModel
    .find({ parent: parentCategory })
    .exec();
}