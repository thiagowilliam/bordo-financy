import type { Metadata } from "next";

import { OnboardingScreen } from "@/features/profile";

export const metadata: Metadata = { title: "Boas-vindas" };

export default function OnboardingPage() {
  return <OnboardingScreen />;
}
