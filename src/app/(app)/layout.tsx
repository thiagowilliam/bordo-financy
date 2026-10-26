import { MobileTopBar } from "@/components/organisms/mobile-top-bar";
import { Sidebar } from "@/components/organisms/sidebar";
import { AppShell } from "@/components/templates/app-shell";
import { TripMobileNav, TripSidebarMenu } from "@/features/trips";

// Static mock until auth exists.
const user = { name: "Marina", email: "marina@email.com" };

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      sidebar={<Sidebar user={user} tripMenu={<TripSidebarMenu />} />}
      mobileHeader={<MobileTopBar userName={user.name} />}
      mobileNav={<TripMobileNav />}
    >
      {children}
    </AppShell>
  );
}
