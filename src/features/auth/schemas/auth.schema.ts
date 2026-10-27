import { z } from "zod";

import { emailSentSchema, profileSchema } from "@/features/profile";

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
