import { ArrowRight, Download, Settings } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DataSectionProps = Omit<React.ComponentProps<"section">, "children"> & {
  onExport: () => void;
  isExporting?: boolean;
};

/** Data card: CSV export action and a link to the settings area. */
export function DataSection({ onExport, isExporting, className, ...props }: DataSectionProps) {
  return (
    <section
      aria-labelledby="data-section-title"
      className={cn(
        "flex flex-col gap-5 rounded-xl border border-border bg-card p-5 md:p-7",
        className,
      )}
      {...props}
    >
      <h2 id="data-section-title" className="text-lg font-bold text-foreground">
        Seus dados
      </h2>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold text-foreground">Exportar meus dados</p>
          <p className="text-sm text-muted-foreground">Baixe todos os seus gastos em CSV.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          className="h-auto shrink-0 px-4 py-2.5 font-semibold"
        >
          <Download aria-hidden />
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </div>
      <hr className="border-border" />
      <Link
        href="/configuracoes/categorias"
        className="flex items-center gap-3 rounded-lg text-sm text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Settings aria-hidden className="size-4.5 shrink-0 text-subtle-foreground" />
        <span className="flex-1">
          Categorias, formas de pagamento e preferências estão em Configurações.
        </span>
        <ArrowRight aria-hidden className="size-4.5 shrink-0 text-primary" />
      </Link>
    </section>
  );
}
