import { AppShell } from "@/components/templates/app-shell";
import { ExpenseDrawer } from "@/features/expenses";
import { ProfileMobileTopBar, ProfileSidebar } from "@/features/profile";
import { TripMobileNav, TripSidebarMenu } from "@/features/trips";

// Shown until the profile loads. Static until auth exists.
const fallbackUser = { name: "Marina", email: "marina@email.com" };

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppShell
        sidebar={<ProfileSidebar fallbackUser={fallbackUser} tripMenu={<TripSidebarMenu />} />}
        mobileHeader={<ProfileMobileTopBar fallbackName={fallbackUser.name} />}
        mobileNav={<TripMobileNav />}
      >
        {children}
      </AppShell>
      <ExpenseDrawer />
    </>
  );
}
