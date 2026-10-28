export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  resetToken: (token: string) => [...authKeys.all, "reset-token", token] as const,
  emailChangeToken: (token: string) => [...authKeys.all, "email-change-token", token] as const,
};
