import CategoryModel, {Category} from "../models/category.model";
import { CustomError } from "../utils/custom.error";

/**
 * Creates a new main category (category without parent)
 * @param input - Category data to create
 * @throws CustomError if category creation fails
 */
export async function createMainCategory(input: Partial<Category>) {
    try {
        return CategoryModel.create(input);
    } catch (error) {
        throw error;
    }
}

/**
 * Creates a new subcategory under a parent category
 * @param input - Category data to create
 * @param parentId - ID of the parent category
 * @throws CustomError if parent category is not found or is not a main category
 */
export async function createSubCategory(input: Partial<Category>, parentId: string) {
    try {
        const parentCategory = await CategoryModel.findById(parentId);
        if (!parentCategory) throw new CustomError("Parent category not found", 404);
        if (parentCategory.parent) throw new CustomError("Parent category is not a main category", 400);

        return CategoryModel.create({
            ...input,
            parent: parentCategory,
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Retrieves all main categories (categories without parents)
 * @returns Promise resolving to an array of main categories
 * @throws CustomError if fetching categories fails
 */
export async function getMainCategories() {
    try {
        return CategoryModel.find({ parent: null }, { parent: 0, __v: 0 }).exec();
    } catch (error) {
        throw error;
    }
}

/**
 * Retrieves all subcategories (categories with parents)
 * @returns Promise resolving to an array of subcategories
 * @throws CustomError if fetching subcategories fails
 */
export default async function getSubCategories() {
    try {
        const subcategories = await CategoryModel.find({ parent: { $ne: null } }, { parent: 0, __v: 0 }).exec();
        return subcategories.map((subcategory) => ({
            ...subcategory.toObject(),
            parent: subcategory.parent ? subcategory.parent.toString() : null,
        }));
    } catch (error) {
        throw error;
    }
}

/**
 * Retrieves all subcategories for a specific parent category
 * @param parentId - ID of the parent category
 * @returns Promise resolving to an array of subcategories
 * @throws CustomError if parent category is not found or is not a main category
 */
export async function getSubCategoriesByParentId(parentId: string) {
    try {
        const parentCategory = await CategoryModel.findById(parentId);
        if (!parentCategory) throw new CustomError("Parent category not found", 404);
        if (parentCategory.parent) throw new CustomError("Parent category is not a main category", 400);

        return CategoryModel.find({ parent: parentCategory }).exec();
    } catch (error) {
        throw error;
    }
}

/**
 * Updates an existing category
 * @param id - ID of the category to update
 * @param input - New category data
 * @returns Promise resolving to the updated category
 * @throws CustomError if category is not found or update fails
 */
export async function updateCategory(id: string, input: Partial<Category>) {
    try {
        const category = await CategoryModel.findById(id);
        if (!category) throw new CustomError("Category not found", 404);

        category.set(input);
        await category.save();
        return category;
    } catch (error) {
        throw error;
    }
}

