"use client";

import { MobileTopBar } from "@/components/organisms/mobile-top-bar";
import { Sidebar } from "@/components/organisms/sidebar";
import { SignOutConfirmDialog, useSignOutFlow } from "@/features/auth";

import { useProfile } from "../api/queries";

export type ProfileSidebarProps = {
  /** Shown while the profile loads or if it fails. */
  fallbackUser: { name: string; email: string };
  tripMenu?: React.ReactNode;
};

/** Desktop sidebar with the logged user's account menu (profile, settings, sign out). */
export function ProfileSidebar({ fallbackUser, tripMenu }: ProfileSidebarProps) {
  const { data } = useProfile();
  const signOut = useSignOutFlow();
  return (
    <>
      <Sidebar
        user={data ? { name: data.name, email: data.email, photoUrl: data.photoUrl } : fallbackUser}
        tripMenu={tripMenu}
        onSignOut={signOut.requestSignOut}
        isSigningOut={signOut.isSigningOut}
      />
      <SignOutConfirmDialog flow={signOut} />
    </>
  );
}

export type ProfileMobileTopBarProps = {
  /** Shown while the profile loads or if it fails. */
  fallbackUser: { name: string; email: string };
};

/** Mobile top bar whose avatar opens the account sheet. */
export function ProfileMobileTopBar({ fallbackUser }: ProfileMobileTopBarProps) {
  const { data } = useProfile();
  const signOut = useSignOutFlow();
  return (
    <>
      <MobileTopBar
        user={data ? { name: data.name, email: data.email, photoUrl: data.photoUrl } : fallbackUser}
        onSignOut={signOut.requestSignOut}
        isSigningOut={signOut.isSigningOut}
      />
      <SignOutConfirmDialog flow={signOut} />
    </>
  );
}
