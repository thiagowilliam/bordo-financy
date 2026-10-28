import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { AppShell } from "@/components/templates/app-shell";
import { ExpenseDrawer } from "@/features/expenses";
import { ProfileMobileTopBar, ProfileSidebar } from "@/features/profile";
import { profileKeys } from "@/features/profile/api/keys";
import { TripMobileNav, TripSidebarMenu } from "@/features/trips";
import { env } from "@/lib/env";
import { getQueryClient } from "@/lib/query-client";
import { getSessionUser } from "@/lib/server-session";

// Shown while the mocks run (there is no session to read) and for a moment if the API is down.
const mockUser = { name: "Marina", email: "marina@email.com" };
const unknownUser = { name: "", email: "" };

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = env.apiMocking ? null : await getSessionUser();
  const fallbackUser = user ?? (env.apiMocking ? mockUser : unknownUser);

  // The session answer is the profile: seed the cache so the sidebar needs no extra request.
  const queryClient = getQueryClient();
  if (user) queryClient.setQueryData(profileKeys.detail(), user);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AppShell
        sidebar={<ProfileSidebar fallbackUser={fallbackUser} tripMenu={<TripSidebarMenu />} />}
        mobileHeader={<ProfileMobileTopBar fallbackUser={fallbackUser} />}
        mobileNav={<TripMobileNav />}
      >
        {children}
      </AppShell>
      <ExpenseDrawer />
    </HydrationBoundary>
  );
}
