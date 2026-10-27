import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Breadcrumb } from "@/components/molecules/breadcrumb";
import { PageHeader } from "@/components/molecules/page-header";
import { Button } from "@/components/ui/button";
import { NewTripForm } from "@/features/trips";

export default function NovaViagemPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-7">
      <Breadcrumb
        className="max-md:hidden"
        items={[{ label: "Minhas viagens", href: "/viagens" }, { label: "Nova viagem" }]}
      />
      <div className="flex flex-col gap-4 md:gap-6">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="size-10 rounded-full bg-card md:hidden"
        >
          <Link href="/viagens" aria-label="Voltar">
            <ChevronLeft aria-hidden="true" className="size-5" />
          </Link>
        </Button>
        <PageHeader
          title="Nova viagem"
          eyebrow="Leva menos de um minuto"
          eyebrowClassName="md:hidden"
          subtitle="Conte o essencial. Você pode ajustar tudo depois."
          subtitleClassName="max-md:hidden"
        />
        <NewTripForm />
      </div>
    </div>
  );
}
