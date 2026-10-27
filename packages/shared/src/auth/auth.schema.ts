import { z } from "zod";

import { isStrongPassword } from "../common/password-strength";

import { emailSentSchema, profileSchema } from "../profile/profile.schema";

export const MIN_PASSWORD_LENGTH = 8;

const email = z.string().trim().min(1, "Informe seu e-mail").pipe(z.email("E-mail inválido"));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Informe sua senha"),
});

export const signUpSchema = z
  .object({
    email,
    password: z.string().min(MIN_PASSWORD_LENGTH, `Use ao menos ${MIN_PASSWORD_LENGTH} caracteres`),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

export const forgotPasswordSchema = z.object({ email });

/** The backend answers with the signed-in user. The session itself travels in the cookie. */
export const authUserSchema = profileSchema;

export { emailSentSchema };

export const signedOutSchema = z.object({});

/** Reset needs a strong password, unlike sign up, which only asks for the minimum length. */
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .refine(isStrongPassword, "Crie uma senha que atenda a todos os requisitos"),
    confirmPassword: z.string().min(1, "Confirme sua nova senha"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem.",
  });

/** What the backend knows about a recovery link: the account it belongs to. */
export const resetTokenSchema = z.object({ email: z.string() });

/** Where the backend sends the user back to `/entrar` when the Google callback fails. */
export const googleErrorSchema = z.enum(["google", "account-exists"]);

export const googleRedirectSchema = z.object({ redirectTo: z.string() });
