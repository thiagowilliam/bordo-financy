import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PageHeader } from "@/components/molecules/page-header";
import { EmptyState } from "@/components/organisms/empty-state";
import { Button } from "@/components/ui/button";

export default function ViagensPage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <PageHeader
        title="Minhas viagens"
        eyebrow="Olá, Marina"
        eyebrowClassName="md:hidden"
        subtitle="Olá, Marina. Suas viagens vão aparecer aqui."
        subtitleClassName="hidden md:block"
      />
      <EmptyState
        title="Sua primeira viagem começa aqui"
        description={
          <>
            <span className="md:hidden">
              Cadastre o destino, registre os custos de base e acompanhe cada gasto. Leva menos de
              um minuto.
            </span>
            <span className="hidden md:inline">
              Cadastre o destino, registre os custos de base e acompanhe cada gasto sem sair do
              orçamento. Leva menos de um minuto.
            </span>
          </>
        }
        illustration={
          <Image
            src="/illustrations/empty-trips.png"
            alt=""
            width={400}
            height={300}
            priority
            className="h-auto w-65 md:w-100"
          />
        }
        action={
          <Button
            asChild
            variant="cta"
            className="h-auto w-full gap-2 rounded-lg px-5.5 py-4 text-base font-bold md:w-auto md:px-7 md:py-[15px] [&_svg:not([class*='size-'])]:size-4.5"
          >
            <Link href="/viagens/nova">
              <Plus aria-hidden="true" />
              Criar primeira viagem
            </Link>
          </Button>
        }
      />
    </div>
  );
}
