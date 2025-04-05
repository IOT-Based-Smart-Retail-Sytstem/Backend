import { getModelForClass,  prop, Ref} from "@typegoose/typegoose";

export class Category {
    @prop({ required: true })
    name: string;

    @prop({ required: true })
    image_url: string;

    @prop({ required: false, default: null })
    parent: Ref<Category> | null;

    @prop({ required: true, default: Date.now })
    createdAt: Date;
};

const CategoryModel = getModelForClass(Category);
export default CategoryModel;