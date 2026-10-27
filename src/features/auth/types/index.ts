import type { z } from "zod";

import type {
  authUserSchema,
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
} from "../schemas/auth.schema";

export type AuthUser = z.infer<typeof authUserSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
