"use client";

import { Check, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

import { CategoryIcon, type CategoryIconName } from "@/components/atoms/category-icon";
import { categoryIcons } from "@/components/atoms/category-icon/category-icon";
import { TextField } from "@/components/atoms/text-field";
import { FormField } from "@/components/molecules/form-field";
import { ResponsiveModal } from "@/components/organisms/responsive-modal";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type CategoryColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type CategoryFormValues = {
  name: string;
  icon: CategoryIconName;
  color: CategoryColor;
};

export type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  /** Values the form starts with each time it opens. */
  initialValues?: CategoryFormValues;
  /** Line under the name in the preview, e.g. "2 lançamentos · Dia a dia". */
  previewSubtitle: string;
  onSubmit: (values: CategoryFormValues) => void;
  isPending?: boolean;
  /** Validation message shown under the name field. */
  error?: string;
};

const iconOptions: CategoryIconName[] = [
  "utensils",
  "coffee",
  "shopping-bag",
  "bus",
  "car",
  "fuel",
  "plane",
  "bed",
  "camera",
  "ticket",
  "gift",
  "heart-pulse",
  "pill",
  "shirt",
  "music",
  "dumbbell",
  "baby",
  "dog",
  "wine",
  "book-open",
  "scissors",
  "wifi",
  "coins",
  "landmark",
];

/** Display order of the palette (visual parity with the design). Values stay the chart numbers. */
const colorOptions: CategoryColor[] = [7, 1, 4, 2, 5, 3, 6, 8];

const swatchBackground: Record<CategoryColor, string> = {
  1: "bg-chart-1",
  2: "bg-chart-2",
  3: "bg-chart-3",
  4: "bg-chart-4",
  5: "bg-chart-5",
  6: "bg-chart-6",
  7: "bg-chart-7",
  8: "bg-chart-8",
};

const defaultValues: CategoryFormValues = { name: "", icon: "utensils", color: 1 };

type RadioOption<T> = { value: T; label: string };

type RadioGridProps<T extends string | number> = {
  label: string;
  options: RadioOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  renderOption: (option: RadioOption<T>, selected: boolean) => React.ReactNode;
  optionClassName: (selected: boolean) => string;
};

/** Radiogroup with a roving tabindex and arrow-key navigation. */
function RadioGrid<T extends string | number>({
  label,
  options,
  value,
  onValueChange,
  className,
  renderOption,
  optionClassName,
}: RadioGridProps<T>) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const current = options.findIndex((option) => option.value === value);
    const nextIndex = (Math.max(current, 0) + step + options.length) % options.length;
    const next = options[nextIndex];
    if (!next) return;
    onValueChange(next.value);
    event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')[nextIndex]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} onKeyDown={handleKeyDown} className={className}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            className={optionClassName(selected)}
          >
            {renderOption(option, selected)}
          </button>
        );
      })}
    </div>
  );
}

const iconRadioOptions = iconOptions.map((icon) => ({ value: icon, label: icon }));
const colorRadioOptions = colorOptions.map((color) => ({ value: color, label: `Cor ${color}` }));

type CategoryFormProps = Omit<CategoryFormDialogProps, "open" | "onOpenChange">;

function CategoryForm({
  mode,
  initialValues = defaultValues,
  previewSubtitle,
  onSubmit,
  isPending = false,
  error,
}: CategoryFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [icon, setIcon] = useState<CategoryIconName>(initialValues.icon);
  const [color, setColor] = useState<CategoryColor>(initialValues.color);

  const trimmed = name.trim();
  const canSave = trimmed !== "" && !isPending;
  const title = mode === "create" ? "Nova categoria" : "Editar categoria";

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (canSave) onSubmit({ name: trimmed, icon, color });
      }}
      className="flex flex-col gap-3.5 md:gap-5"
    >
      <header className="flex items-center justify-between gap-4">
        <DialogTitle className="text-xl leading-tight font-bold tracking-[-0.3px] text-foreground md:text-[22px]">
          {title}
        </DialogTitle>
        <DialogClose
          aria-label="Fechar"
          disabled={isPending}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X aria-hidden className="size-4" />
        </DialogClose>
      </header>
      <DialogDescription className="sr-only">
        Defina o nome, o ícone e a cor da categoria.
      </DialogDescription>

      <div className="flex items-center gap-3 rounded-lg bg-background px-3.5 py-3 md:gap-3.5 md:px-4 md:py-3.5">
        <CategoryIcon icon={icon} color={color} className="size-[42px] md:size-11" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[15px] leading-5 font-semibold text-foreground md:text-base">
            {trimmed || "Nova categoria"}
          </span>
          <span className="text-xs leading-4 text-muted-foreground md:text-[13px]">
            {previewSubtitle}
          </span>
        </div>
        <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] leading-[14px] font-bold text-muted-foreground">
          Prévia
        </span>
      </div>

      <FormField label="Nome" error={error}>
        {(control) => (
          <TextField
            {...control}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            autoComplete="off"
            maxLength={40}
            placeholder="Ex.: Farmácia"
            className="focus-visible:border-[1.5px] focus-visible:border-primary focus-visible:ring-0"
          />
        )}
      </FormField>

      <div className="flex flex-col gap-2 md:gap-2.5">
        <span className="text-sm font-semibold text-foreground">Ícone</span>
        <RadioGrid
          label="Ícone"
          options={iconRadioOptions}
          value={icon}
          onValueChange={setIcon}
          className="grid grid-cols-8 gap-1.5 gap-y-2 md:[grid-template-columns:repeat(8,52px)] md:justify-between md:gap-y-2.5"
          optionClassName={(selected) =>
            cn(
              "flex h-[38px] w-full items-center justify-center rounded-md border outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:h-[46px] [&_svg]:size-[18px] md:[&_svg]:size-5",
              selected
                ? "border-[1.5px] border-primary bg-primary-soft text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-secondary",
            )
          }
          renderOption={({ value }) => {
            const Icon = categoryIcons[value];
            return <Icon aria-hidden />;
          }}
        />
      </div>

      <div className="flex flex-col gap-2 md:gap-2.5">
        <span className="text-sm font-semibold text-foreground">Cor</span>
        <RadioGrid
          label="Cor"
          options={colorRadioOptions}
          value={color}
          onValueChange={setColor}
          className="flex justify-between"
          optionClassName={(selected) =>
            cn(
              "flex size-[38px] shrink-0 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:size-11",
              selected ? "border-foreground" : "border-transparent",
            )
          }
          renderOption={({ value }, selected) => (
            <span
              className={cn(
                "flex size-[30px] items-center justify-center rounded-full text-white md:size-[34px]",
                swatchBackground[value],
              )}
            >
              {selected ? <Check aria-hidden className="size-3.5 md:size-4" /> : null}
            </span>
          )}
        />
      </div>

      <footer className="flex flex-row gap-2 pt-1 md:justify-end md:gap-3">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            className="h-auto flex-1 gap-2 border border-border bg-card px-6 py-3.5 text-base font-bold md:flex-none [&_svg]:size-[18px]"
          >
            Cancelar
          </Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={!canSave}
          className="h-auto flex-1 gap-2 px-6 px-7 py-3.5 text-base font-bold md:flex-none [&_svg]:size-[18px]"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </footer>
    </form>
  );
}

/** Create or edit a category: live preview, name, icon and color. State resets each time it opens. */
export function CategoryFormDialog({ open, onOpenChange, ...formProps }: CategoryFormDialogProps) {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      locked={formProps.isPending}
      desktopClassName="sm:max-w-[540px]"
    >
      <CategoryForm {...formProps} />
    </ResponsiveModal>
  );
}
