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

/** What the sign-up form sends: the confirmation field stays in the browser. */
export const signUpBodySchema = z.object({
  email,
  password: z.string().min(MIN_PASSWORD_LENGTH, `Use ao menos ${MIN_PASSWORD_LENGTH} caracteres`),
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

/** Body of `POST /api/auth/reset-password`: the e-mailed token and the new (strong) password. */
export const resetPasswordBodySchema = z.object({
  token: z.string().min(1),
  password: z.string().refine(isStrongPassword, "Crie uma senha que atenda a todos os requisitos"),
});

/** What the backend knows about a recovery link: the account it belongs to. */
export const resetTokenSchema = z.object({ email: z.string() });

/** Where the backend sends the user back to `/entrar` when the Google callback fails. */
export const googleErrorSchema = z.enum(["google", "account-exists"]);

export const googleRedirectSchema = z.object({ redirectTo: z.string() });

/** Body of `POST /api/auth/email-change/confirm`: the token of the link e-mailed to the new address. */
export const confirmEmailChangeSchema = z.object({ token: z.string().min(1) });

/** `GET /api/auth/email-change/:token`: the address that link would switch the account to. */
export const emailChangeTokenSchema = z.object({ email: z.string() });

/** `POST /api/auth/email-change/confirm`: the account's new address. */
export const emailChangedSchema = z.object({ email: z.string() });
