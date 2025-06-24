import { getModelForClass, prop } from "@typegoose/typegoose";

export enum ProductState {
    AVAILABLE = 'available',
    OUT = 'out',
    LOW = 'low'
}

export class Product {
    @prop({ required: true })
    title: string
    
    @prop({ required: true })
    price: number

    @prop({ required: true })
    brand: string

    @prop({ required: true })
    description: string

    @prop({ required: true })
    highlights: string

    @prop({ required: true })
    image_url: string

    @prop({ required: true })
    barcode: string

    @prop({ required: true })
    stock: number

    @prop({ required: true})
    item_weight: string
    @prop({required: true})
    subCategoryId: string

    @prop({required: true})
    categoryId: string

    @prop({ required: false, default: 0 })
    sold: number

    @prop({ required: false, default: 0 })
    rating: number

    @prop({ required: false, default: 0 })
    discount: number

    @prop({ required: false, default: [] })
    images: string[]

    @prop({ required: true, enum: ProductState, default: ProductState.AVAILABLE })
    state: ProductState

    @prop({ required: false, default: Date.now })
    createdAt: Date
}

const ProductModel = getModelForClass(Product);

export default ProductModel;