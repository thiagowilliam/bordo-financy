import { ProfileScreen } from "@/features/profile";

export default async function PerfilPage({ searchParams }: PageProps<"/perfil">) {
  const { google } = await searchParams;
  return <ProfileScreen googleError={google === "error"} />;
}
