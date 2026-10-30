import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type LegalDocumentProps = Omit<React.ComponentProps<"main">, "title"> & {
  title: string;
  /** Already formatted pt-BR date text, e.g. "30 de outubro de 2026". */
  updatedAt: string;
  /** The document body, usually a list of `LegalSection`. */
  children: React.ReactNode;
};

/** Page skeleton for long legal texts (termos, privacidade): readable column on the sand background. */
export function LegalDocument({
  title,
  updatedAt,
  children,
  className,
  ...props
}: LegalDocumentProps) {
  return (
    <main
      className={cn("min-h-svh bg-background px-5 py-8 md:px-8 md:py-14", className)}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-[68ch] flex-col gap-8 md:gap-10">
        <header className="flex flex-col gap-4">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Voltar
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] leading-tight font-bold tracking-[-0.6px] text-foreground md:text-4xl">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">Atualizado em {updatedAt}</p>
          </div>
        </header>
        <div className="flex flex-col gap-8 md:gap-10">{children}</div>
      </div>
    </main>
  );
}
