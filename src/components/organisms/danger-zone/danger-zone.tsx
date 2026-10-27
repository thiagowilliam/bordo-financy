import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DangerZoneProps = Omit<React.ComponentProps<"section">, "children"> & {
  onDelete: () => void;
};

/** Destructive area of the profile: delete account. */
export function DangerZone({ onDelete, className, ...props }: DangerZoneProps) {
  return (
    <section
      aria-labelledby="danger-zone-title"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-destructive/30 bg-card p-5 md:p-7",
        className,
      )}
      {...props}
    >
      <h2
        id="danger-zone-title"
        className="text-[11px] font-bold tracking-[0.08em] text-destructive-ink"
      >
        ZONA DE RISCO
      </h2>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold text-foreground">Excluir conta</p>
          <p className="text-sm text-muted-foreground">
            Todas as suas viagens, gastos e fotos serão apagados permanentemente.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onDelete}
          className="h-auto shrink-0 border-destructive/40 bg-card px-4 py-2.5 font-semibold text-destructive-ink hover:bg-destructive-soft hover:text-destructive-ink"
        >
          <Trash2 aria-hidden />
          Excluir conta
        </Button>
      </div>
    </section>
  );
}
