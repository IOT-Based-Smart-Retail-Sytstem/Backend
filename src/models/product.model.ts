import { getModelForClass, Prop } from "@typegoose/typegoose";

class Product {
    @Prop({ required: true })
    name: string

    @Prop({ required: true })
    price: number

    @Prop({ required: true })
    description: string

    @Prop({ required: true })
    image: string

    @Prop({ required: true })
    category: string

    @Prop({ required: true })
    barcode: string

    @Prop({ required: true })
    stock: number

    @Prop({ required: false, default: 0 })
    discount: number

    @Prop({ required: false, default: Date.now })
    createdAt: Date
}

const ProductModel = getModelForClass(Product);

export default ProductModel;