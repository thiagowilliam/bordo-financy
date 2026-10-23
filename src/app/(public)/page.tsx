import Link from "next/link";

import { Logo } from "@/components/atoms/logo";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <Logo />
      <Button asChild variant="cta" size="lg">
        <Link href="/viagens">Entrar</Link>
      </Button>
    </main>
  );
}
