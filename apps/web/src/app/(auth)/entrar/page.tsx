import type { Metadata } from "next";

import { googleErrorSchema, SignInScreen } from "@/features/auth";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  const { next, error } = await searchParams;
  return (
    <SignInScreen
      next={typeof next === "string" ? next : undefined}
      error={googleErrorSchema.safeParse(error).data}
    />
  );
}
