import {
  authUserSchema,
  emailChangedSchema,
  emailChangeTokenSchema,
  resetTokenSchema,
  signedOutSchema,
} from "@bordo/shared/auth";
import { categorySchema, deletedCategorySchema } from "@bordo/shared/categories";
import { baseCostSchema } from "@bordo/shared/base-costs";
import { deletedExpenseSchema, expenseSchema } from "@bordo/shared/expenses";
import { deletedPhotoSchema, photoSchema } from "@bordo/shared/photos";
import { deletedProfileSchema, emailSentSchema, profileStatsSchema } from "@bordo/shared/profile";
import {
  deletedTripSchema,
  tripDetailSchema,
  tripSchema,
  tripSummarySchema,
} from "@bordo/shared/trips";
import { createZodDto } from "nestjs-zod";

/**
 * Response bodies, only for the OpenAPI document. They are built from the same shared schemas the
 * web client parses the answers with, so the docs cannot drift from what the app expects.
 */
export class UserDto extends createZodDto(authUserSchema) {}
export class SignedOutDto extends createZodDto(signedOutSchema) {}
export class EmailSentDto extends createZodDto(emailSentSchema) {}
export class ResetTokenDto extends createZodDto(resetTokenSchema) {}
export class EmailChangeTokenDto extends createZodDto(emailChangeTokenSchema) {}
export class EmailChangedDto extends createZodDto(emailChangedSchema) {}

export class ProfileStatsDto extends createZodDto(profileStatsSchema) {}
export class DeletedProfileDto extends createZodDto(deletedProfileSchema) {}

export class CategoryDto extends createZodDto(categorySchema) {}
export class DeletedCategoryDto extends createZodDto(deletedCategorySchema) {}

export class TripDto extends createZodDto(tripSchema) {}
export class TripSummaryDto extends createZodDto(tripSummarySchema) {}
export class TripDetailDto extends createZodDto(tripDetailSchema) {}
export class DeletedTripDto extends createZodDto(deletedTripSchema) {}

export class ExpenseDto extends createZodDto(expenseSchema) {}
export class BaseCostDto extends createZodDto(baseCostSchema) {}
export class DeletedExpenseDto extends createZodDto(deletedExpenseSchema) {}

export class PhotoDto extends createZodDto(photoSchema) {}
export class DeletedPhotoDto extends createZodDto(deletedPhotoSchema) {}
