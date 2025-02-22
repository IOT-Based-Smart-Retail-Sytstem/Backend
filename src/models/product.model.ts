import { getModelForClass, prop, Prop } from "@typegoose/typegoose";

export class Product {
    @Prop({ required: true })
    title: string

    @Prop({ required: true })
    price: number

    @Prop({ required: true })
    description: string

    @Prop({ required: true })
    image_url: string

    @Prop({ required: true })
    categories: string[]

    @Prop({ required: true })
    barcode: string

    @Prop({ required: true })
    stock: number

    @prop({ required: true})
    item_weight: string

    @Prop({ required: false, default: 0 })
    discount: number

    @Prop({ required: false, default: [] })
    images: string[]

    @Prop({ required: false, default: Date.now })
    createdAt: Date
}

const ProductModel = getModelForClass(Product);

export default ProductModel;