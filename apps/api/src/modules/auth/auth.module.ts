import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller.js";
import { AuthRepository } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";
import { MailerService } from "./mailer.service.js";
import { PasswordService } from "./password.service.js";
import { SessionsService } from "./sessions.service.js";

@Module({
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, SessionsService, PasswordService, MailerService],
  exports: [SessionsService, AuthService],
})
export class AuthModule {}
