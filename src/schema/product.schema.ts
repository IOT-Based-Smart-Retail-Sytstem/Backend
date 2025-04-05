import { array, number, object, string, TypeOf } from "zod";

export const createProductSchema = object({
    body: object({
        title: string({ required_error: 'title is required' }),
        price: string({ required_error: 'Price is required' }),
        description: string({ required_error: 'Description is required' }),
        image_url: string({ required_error: 'Image is required' }),
        categories: array(string(), { required_error: 'Categories is required' }),
        barcode: string({ required_error: 'Barcode is required' }),
        stock: number({ required_error: 'Stock is required' }),
        item_weight: string({ required_error: 'Item weight is required' }),
    })
});

export type CreateProductInput = TypeOf<typeof createProductSchema>['body']