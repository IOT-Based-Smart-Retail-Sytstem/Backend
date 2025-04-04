import { object, string, number, TypeOf } from "zod";

export const addToCartSchema = object({
  body: object({
    productId: string({
      required_error: "Product ID is required",
    }),
    quantity: number({
      required_error: "Quantity is required",
    }).min(1, "Quantity must be at least 1"),
  }),
});

export const updateCartItemSchema = object({
    body: object({
      quantity: number({
        required_error: "Quantity is required",
      }).min(1, "Quantity must be at least 1"),
    }),
  });

  export const removeFromCartSchema = object({
    params: object({
      productId: string({
        required_error: "Product ID is required",
      }),
    }),
  });

  export const getCartSchema = object({
    params: object({
      userId: string({
        required_error: "User ID is required",
      }),
    }),
  });

export const createCartSchema = object({
    body: object({
      userId: string({
        required_error: "User ID is required",
      }),
    }),
  });
  
export type CreateCartInput = TypeOf<typeof createCartSchema>["body"];
export type GetCartInput = TypeOf<typeof getCartSchema>["params"];
export type RemoveFromCartInput = TypeOf<typeof removeFromCartSchema>["params"];
export type UpdateCartItemInput = TypeOf<typeof updateCartItemSchema>["body"];
export type AddToCartInput = TypeOf<typeof addToCartSchema>["body"];