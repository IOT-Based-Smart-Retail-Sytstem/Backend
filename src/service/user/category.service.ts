import CategoryModel, {Category} from "../../models/user/category.model";

export async function createCategory(input: Partial<Category>, parentId?: string) {
    if (parentId) {
        const parentCategory = await CategoryModel.findById(parentId);
        return CategoryModel.create({
            ...input,
            parent: parentCategory,
        });
    }
    // If no parentId is provided, create a main category
  return CategoryModel.create(input);
}

export async function getMainCategories() {
  return CategoryModel.find({ parent: null }).exec();
}

export async function getSubCategories() {
    return CategoryModel.find({ parent: { $ne: null } }).exec();
}

export async function getCategoryById(categoryId: string) {
  return CategoryModel
    .findById(categoryId)
    .populate("parent")
    .exec();
}

export async function getSubCategoryById(subCategoryId: string) {
  return CategoryModel
    .findById(subCategoryId)
    .populate("parent")
    .exec();
}

export async function getSubCategoriesByParentId(parentId: string) {
    const parentCategory = await CategoryModel.findById(parentId);
  return CategoryModel
    .find({ parent: parentCategory })
    .exec();
}