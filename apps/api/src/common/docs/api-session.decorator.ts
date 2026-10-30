import { applyDecorators } from "@nestjs/common";
import { ApiCookieAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";

/** Marks a route (or every route of a controller) as needing the `bordo_session` cookie. */
export const ApiSession = () =>
  applyDecorators(
    ApiCookieAuth(),
    ApiUnauthorizedResponse({ description: "No session, or the session expired." }),
  );
