import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type UnsavedChangesBarProps = Omit<React.ComponentProps<"div">, "children"> & {
  visible: boolean;
  onDiscard: () => void;
  onSave: () => void;
  isSaving?: boolean;
};

/** Fixed bottom bar shown while a form has unsaved changes. Renders nothing when hidden. */
export function UnsavedChangesBar({
  visible,
  onDiscard,
  onSave,
  isSaving,
  className,
  ...props
}: UnsavedChangesBarProps) {
  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Alterações não salvas"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 border-t border-border bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg md:inset-x-auto md:bottom-6 md:left-1/2 md:w-max md:max-w-[calc(100vw-2rem)] md:-translate-x-1/2 md:gap-6 md:rounded-xl md:border md:px-5 md:py-3",
        className,
      )}
      {...props}
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-warning" />
        Alterações não salvas
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onDiscard}
          disabled={isSaving}
          className="h-auto px-4 py-2.5 font-semibold"
        >
          Descartar
        </Button>
        <Button
          type="button"
          variant="cta"
          onClick={onSave}
          disabled={isSaving}
          className="h-auto px-4 py-2.5 font-semibold"
        >
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
