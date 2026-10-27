import { existsSync } from "node:fs";

// Imported first by main.ts: ES imports run in order, and AppModule validates the environment
// as soon as it is imported. Real environment variables win over the file.
if (process.env.NODE_ENV !== "production" && existsSync(".env")) {
  process.loadEnvFile(".env");
}
