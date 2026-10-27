"use client";

import { MobileTopBar } from "@/components/organisms/mobile-top-bar";
import { Sidebar } from "@/components/organisms/sidebar";

import { useProfile } from "../api/queries";

export type ProfileSidebarProps = {
  /** Shown while the profile loads or if it fails. */
  fallbackUser: { name: string; email: string };
  tripMenu?: React.ReactNode;
};

/** Desktop sidebar with the logged user's name, e-mail and photo. */
export function ProfileSidebar({ fallbackUser, tripMenu }: ProfileSidebarProps) {
  const { data } = useProfile();
  return (
    <Sidebar
      user={data ? { name: data.name, email: data.email, photoUrl: data.photoUrl } : fallbackUser}
      tripMenu={tripMenu}
    />
  );
}

export type ProfileMobileTopBarProps = {
  /** Shown while the profile loads or if it fails. */
  fallbackName: string;
};

/** Mobile top bar with the logged user's photo. */
export function ProfileMobileTopBar({ fallbackName }: ProfileMobileTopBarProps) {
  const { data } = useProfile();
  return <MobileTopBar userName={data?.name ?? fallbackName} userPhotoUrl={data?.photoUrl} />;
}
