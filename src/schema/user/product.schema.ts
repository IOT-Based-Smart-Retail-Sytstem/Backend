import { number, object, string, TypeOf, enum as zodEnum } from "zod";
import { ProductState } from "../../models/product.model";

export const createProductSchema = object({
    body: object({
        title: string({ required_error: 'title is required' }),
        price: number({ required_error: 'Price is required' }),
        description: string({ required_error: 'Description is required' }),
        highlights: string({ required_error: 'Highlights is required' }),
        brand: string({ required_error: 'Brand is required' }),
        subCategoryId: string({ required_error: 'Sub category is required' }),
        categoryId: string({ required_error: 'Category is required' }),
        image_url: string({ required_error: 'Image is required' }),
        barcode: string({ required_error: 'Barcode is required' }),
        stock: number({ required_error: 'Stock is required' }),
        item_weight: string({ required_error: 'Item weight is required' }),
        shelfNumber: number({ required_error: 'Shelf number is required' }),
        state: zodEnum([ProductState.AVAILABLE, ProductState.OUT, ProductState.LOW], {
            required_error: 'State is required',
            invalid_type_error: 'Invalid state value'
        }).default(ProductState.AVAILABLE),
    })
});

export type CreateProductInput = TypeOf<typeof createProductSchema>['body']