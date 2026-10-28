import { createHash, randomBytes } from "node:crypto";

/** 256 bits from the CSPRNG, URL safe. This is what goes in the cookie or the e-mailed link. */
export const generateToken = () => randomBytes(32).toString("base64url");

/** Only this hash is stored, so a database leak does not hand out working sessions or links. */
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Keys the e-mail rate limit without keeping the address in Redis. */
export const hashEmail = (email: string) => hashToken(email.trim().toLowerCase());
