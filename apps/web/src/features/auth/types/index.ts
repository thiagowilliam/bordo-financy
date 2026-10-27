import type { z } from "zod";

import type {
  authUserSchema,
  forgotPasswordSchema,
  googleErrorSchema,
  newPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@bordo/shared/auth";

export type AuthUser = z.infer<typeof authUserSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type GoogleError = z.infer<typeof googleErrorSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
