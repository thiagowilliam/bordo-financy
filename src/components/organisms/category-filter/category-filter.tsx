"use client";

import { Check, Search, Tag } from "lucide-react";
import { useState } from "react";

import { CategoryIcon, type CategoryIconName } from "@/components/atoms/category-icon";
import { FilterButton } from "@/components/molecules/filter-button";
import { FilterSurface } from "@/components/molecules/filter-surface";
import { cn } from "@/lib/utils";

export type CategoryFilterOption = {
  id: string;
  name: string;
  icon: CategoryIconName;
  color: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Number of entries in the category. */
  count: number;
};

export type CategoryFilterProps = {
  options: CategoryFilterOption[];
  /** Selected category ids. */
  value: string[];
  onValueChange: (ids: string[]) => void;
  className?: string;
};

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function CategoryFilter({ options, value, onValueChange, className }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [staged, setStaged] = useState<string[]>(value);
  const [query, setQuery] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setStaged(value);
      setQuery("");
    }
    setOpen(next);
  };

  const toggle = (id: string) =>
    setStaged((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const apply = () => {
    onValueChange(
      options.filter((option) => staged.includes(option.id)).map((option) => option.id),
    );
    setOpen(false);
  };

  const visible = options.filter((option) => normalize(option.name).includes(normalize(query)));

  return (
    <FilterSurface
      open={open}
      onOpenChange={handleOpenChange}
      title="Categoria"
      popoverClassName="w-80"
      mobileAction={
        <button
          type="button"
          onClick={() => setStaged([])}
          className="rounded-md text-sm font-semibold text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Limpar
        </button>
      }
      trigger={
        <FilterButton
          icon={<Tag />}
          label="Categoria"
          count={value.length}
          active={value.length > 0}
          open={open}
          className={className}
        />
      }
    >
      {(isDesktop) => (
        <div className="flex min-h-0 flex-col gap-3.5 md:gap-1.5">
          <label className="flex items-center gap-2 rounded-lg bg-background px-3.5 py-[11px] focus-within:ring-3 focus-within:ring-ring/50 md:px-3 md:py-2.5">
            <Search aria-hidden className="size-[15px] shrink-0 text-subtle-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar categoria"
              aria-label="Buscar categoria"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle-foreground"
            />
          </label>
          <p className="hidden text-[11px] font-bold tracking-[1px] text-subtle-foreground md:block">
            SELECIONE UMA OU MAIS
          </p>
          <div
            role="group"
            aria-label="Categorias"
            className="flex max-h-84 flex-col gap-0.5 overflow-y-auto"
          >
            {visible.map((option) => {
              const checked = staged.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggle(option.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2.5 py-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:gap-2.5 md:py-2",
                    checked ? "bg-primary-soft" : "hover:bg-muted",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px]",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                  >
                    {checked ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                  <CategoryIcon
                    icon={option.icon}
                    color={option.color}
                    tone="soft"
                    size="sm"
                    className="size-[30px] rounded-lg"
                  />
                  <span className="flex-1 text-sm font-medium text-foreground">{option.name}</span>
                  <span className="text-xs text-subtle-foreground">{option.count}</span>
                  {checked ? <Check aria-hidden className="size-4 shrink-0 text-primary" /> : null}
                </button>
              );
            })}
            {visible.length === 0 ? (
              <p className="px-2.5 py-4 text-center text-sm text-muted-foreground">
                Nenhuma categoria encontrada
              </p>
            ) : null}
          </div>
          {isDesktop ? (
            <>
              <hr className="border-border" />
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setStaged([])}
                  className="rounded-md text-[13px] font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  Limpar seleção
                </button>
                <button
                  type="button"
                  onClick={apply}
                  className="rounded-md bg-primary px-4 py-2 text-[13px] font-bold text-primary-foreground outline-none hover:bg-primary-strong focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  Aplicar
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={apply}
              className="mt-2 w-full rounded-lg bg-primary px-4 py-4 text-base font-bold text-primary-foreground outline-none hover:bg-primary-strong focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Aplicar
            </button>
          )}
        </div>
      )}
    </FilterSurface>
  );
}
