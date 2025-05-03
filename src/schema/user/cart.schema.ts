import { object, string, TypeOf } from "zod";

export const createCartSchema = object({
    body: object({
      qrCode: string({
        required_error: "qrCode is required",
      }),
    }),
  });
  
export type CreateCartInput = TypeOf<typeof createCartSchema>["body"];