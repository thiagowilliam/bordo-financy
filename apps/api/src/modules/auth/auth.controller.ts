import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiGoneResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ApiSession } from "../../common/docs/api-session.decorator.js";
import {
  EmailChangedDto,
  EmailChangeTokenDto,
  EmailSentDto,
  ResetTokenDto,
  SignedOutDto,
  UserDto,
} from "../../common/docs/responses.js";
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

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiOperation({ summary: "Create an account with e-mail and password. Sets the session cookie" })
  @ApiCreatedResponse({ type: UserDto })
  @ApiConflictResponse({ description: "There is already an account with this e-mail." })
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

  @ApiOperation({ summary: "Sign in with e-mail and password. Sets the session cookie" })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse({ description: "Wrong e-mail or password." })
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

  @ApiOperation({ summary: "Sign out and clear the session cookie" })
  @ApiOkResponse({ type: SignedOutDto })
  /** Public so a stale cookie can still be cleared. */
  @Public()
  @Post("sign-out")
  @HttpCode(200)
  async signOut(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.auth.signOut(request.cookies?.[SESSION_COOKIE]);
    clearSessionCookie(reply);
    return {};
  }

  @ApiOperation({ summary: "The signed-in user" })
  @ApiSession()
  @ApiOkResponse({ type: UserDto })
  @Get("session")
  session(@CurrentUser() user: SessionUser) {
    return user;
  }

  @ApiOperation({
    summary:
      "E-mail a password recovery link. Answers the same whether or not the e-mail has an account",
  })
  @ApiOkResponse({ type: EmailSentDto })
  @Public()
  @Post("forgot-password")
  @HttpCode(200)
  forgotPassword(@Body() body: ForgotPasswordDto, @Req() request: FastifyRequest) {
    return this.auth.forgotPassword(body, clientOf(request));
  }

  @ApiOperation({ summary: "Check a password recovery link" })
  @ApiOkResponse({ type: ResetTokenDto })
  @ApiGoneResponse({ description: "The link expired or was already used." })
  @Public()
  @Get("reset-password/:token")
  checkResetToken(@Param("token") token: string) {
    return this.auth.checkResetToken(token);
  }

  @ApiOperation({ summary: "Check an e-mail change link and get the address it would switch to" })
  @ApiOkResponse({ type: EmailChangeTokenDto })
  @ApiGoneResponse({ description: "The link expired or was already used." })
  /** The address a confirmation link would switch the account to. */
  @Public()
  @Get("email-change/:token")
  checkEmailChange(@Param("token") token: string) {
    return this.auth.checkEmailChangeToken(token);
  }

  @ApiOperation({ summary: "Confirm an e-mail change. Ends every session of the account" })
  @ApiOkResponse({ type: EmailChangedDto })
  @ApiGoneResponse({ description: "The link expired or was already used." })
  @ApiConflictResponse({ description: "The address was taken in the meantime." })
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

  @ApiOperation({
    summary: "Set a new password with a recovery link. Ends every session of the account",
  })
  @ApiOkResponse({ type: SignedOutDto })
  @ApiGoneResponse({ description: "The link expired or was already used." })
  @Public()
  @Post("reset-password")
  @HttpCode(200)
  resetPassword(@Body() body: ResetPasswordDto, @Req() request: FastifyRequest) {
    return this.auth.resetPassword(body, clientOf(request));
  }
}
