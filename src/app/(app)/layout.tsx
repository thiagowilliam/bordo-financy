import { MobileTopBar } from "@/components/organisms/mobile-top-bar";
import { Sidebar } from "@/components/organisms/sidebar";
import { AppShell } from "@/components/templates/app-shell";

// Static mock until auth exists.
const user = { name: "Marina", email: "marina@email.com" };

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      sidebar={<Sidebar user={user} />}
      mobileHeader={<MobileTopBar userName={user.name} />}
    >
      {children}
    </AppShell>
  );
}
