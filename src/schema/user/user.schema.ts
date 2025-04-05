import { object, string, TypeOf } from "zod";

export const createUserSchema = object({
    body: object({
      firstName: string({
        required_error: "First name is required",
      }),
      lastName: string({
        required_error: "Last name is required",
      }),
      password: string({
        required_error: "Password is required",
      }).min(6, "Password is too short - should be min 6 chars"),
      passwordConfirmation: string({
        required_error: "Password confirmation is required",
      }),
      email: string({
        required_error: "Email is required",
      }).email("Not a valid email"),
      phoneNumber: string({
        required_error: "Phone number is required",
      }).regex(/^[0-9]{10,15}$/, "Invalid phone number format"),
     
      role: string().optional().default('user'),

    }).refine((data) => data.password === data.passwordConfirmation, {
      message: "Passwords do not match",
      path: ["passwordConfirmation"],
    }),
});

export const verifyUserSchema = object({
  body: object({
    verificationCode: string(),
  }),
});

export const forgotPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
  }),
});

export const resetPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }).email("Invalid email format"),
    passwordResetCode: string({
      required_error: "Password reset code is required",
    }),
    password: string({
      required_error: "Password is required",
    }).min(6, "Password is too short - should be min 6 chars"),
    passwordConfirmation: string({
      required_error: "Password confirmation is required",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];

export type VerifyUserInput = TypeOf<typeof verifyUserSchema>["body"];

export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>["body"];

export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;