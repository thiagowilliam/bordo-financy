import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { MswProvider } from "./msw-provider";
import { QueryProvider } from "./query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MswProvider>
      <QueryProvider>
        <NuqsAdapter>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-center" />
        </NuqsAdapter>
      </QueryProvider>
    </MswProvider>
  );
}
