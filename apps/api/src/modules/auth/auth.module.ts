import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller.js";
import { GoogleAuthController } from "./google-auth.controller.js";
import { GoogleAuthService } from "./google-auth.service.js";
import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";
import { PasswordService } from "./password.service.js";
import { SessionsService } from "./sessions.service.js";

@Module({
  controllers: [AuthController, GoogleAuthController],
  providers: [AuthRepository, AuthService, GoogleAuthService, SessionsService, PasswordService],
  exports: [SessionsService, AuthService],
})
export class AuthModule {}
