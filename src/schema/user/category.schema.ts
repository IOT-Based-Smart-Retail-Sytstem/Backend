import { object, TypeOf, string } from "zod";

export const createCategorySchema = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }),
    image_url: string({
      required_error: "Image URL is required",
    }),
    background_image: string().optional(),
  }),
});

export const updateCategorySchema = object({
  params: object({
    id: string({
      required_error: "Category ID is required",
    }),
  }),
  body: object({
    name: string().optional(),
    image_url: string().optional(),
    background_image: string().optional(),
  }),
});

export const getCategorySchema = object({
  params: object({
    id: string({
      required_error: "Category ID is required",
    }),
  }),
});



export type CreateCategoryInput = TypeOf<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = TypeOf<typeof updateCategorySchema>["body"];
export type GetCategoryInput = TypeOf<typeof getCategorySchema>["params"];