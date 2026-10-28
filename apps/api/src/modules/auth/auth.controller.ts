import { Body, Controller, Get, HttpCode, Param, Post, Req, Res } from "@nestjs/common";
import {
  confirmEmailChangeSchema,
  forgotPasswordSchema,
  resetPasswordBodySchema,
  signInSchema,
  signUpBodySchema,
} from "@bordo/shared/auth";
import { createZodDto } from "nestjs-zod";
import type { FastifyReply, FastifyRequest } from "fastify";

import { AuthService } from "./auth.service.js";
import { SESSION_COOKIE } from "./auth.constants.js";
import { CurrentUser } from "./current-user.decorator.js";
import { Public } from "./public.decorator.js";
import { clearSessionCookie, setSessionCookie } from "./session-cookie.js";
import type { SessionUser } from "./session-user.js";

class SignInDto extends createZodDto(signInSchema) {}
class SignUpDto extends createZodDto(signUpBodySchema) {}
class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}
class ResetPasswordDto extends createZodDto(resetPasswordBodySchema) {}
class ConfirmEmailChangeDto extends createZodDto(confirmEmailChangeSchema) {}

const clientOf = (request: FastifyRequest) => ({
  ip: request.ip,
  userAgent: request.headers["user-agent"] ?? null,
});

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("sign-up")
  async signUp(
    @Body() body: SignUpDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { user, token } = await this.auth.signUp(body, clientOf(request));
    setSessionCookie(reply, token);
    return user;
  }

  @Public()
  @Post("sign-in")
  @HttpCode(200)
  async signIn(
    @Body() body: SignInDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const { user, token } = await this.auth.signIn(body, clientOf(request));
    setSessionCookie(reply, token);
    return user;
  }

  /** Public so a stale cookie can still be cleared. */
  @Public()
  @Post("sign-out")
  @HttpCode(200)
  async signOut(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.auth.signOut(request.cookies?.[SESSION_COOKIE]);
    clearSessionCookie(reply);
    return {};
  }

  @Get("session")
  session(@CurrentUser() user: SessionUser) {
    return user;
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(200)
  forgotPassword(@Body() body: ForgotPasswordDto, @Req() request: FastifyRequest) {
    return this.auth.forgotPassword(body, clientOf(request));
  }

  @Public()
  @Get("reset-password/:token")
  checkResetToken(@Param("token") token: string) {
    return this.auth.checkResetToken(token);
  }

  /** The address a confirmation link would switch the account to. */
  @Public()
  @Get("email-change/:token")
  checkEmailChange(@Param("token") token: string) {
    return this.auth.checkEmailChangeToken(token);
  }

  /** Ends every session of the account, so the browser's cookie is cleared too. */
  @Public()
  @Post("email-change/confirm")
  @HttpCode(200)
  async confirmEmailChange(
    @Body() body: ConfirmEmailChangeDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.auth.confirmEmailChange(body.token, clientOf(request));
    clearSessionCookie(reply);
    return result;
  }

  @Public()
  @Post("reset-password")
  @HttpCode(200)
  resetPassword(@Body() body: ResetPasswordDto, @Req() request: FastifyRequest) {
    return this.auth.resetPassword(body, clientOf(request));
  }
}
