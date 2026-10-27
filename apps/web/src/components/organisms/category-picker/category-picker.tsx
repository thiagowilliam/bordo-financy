"use client";

import { Command as CommandPrimitive } from "cmdk";
import { ArrowLeft, Check, Plus, Search, Tag } from "lucide-react";
import { useState } from "react";

import { CategoryIcon, type CategoryIconName } from "@/components/atoms/category-icon";
import { categoryIcons } from "@/components/atoms/category-icon/category-icon";
import { FilterSurface } from "@/components/molecules/filter-surface";
import { PickerField } from "@/components/molecules/picker-field";
import { cn } from "@/lib/utils";

export type CategoryPickerOption = {
  id: string;
  name: string;
  icon: CategoryIconName;
  color: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  usageCount: number;
};

export type CategoryPickerProps = {
  /** Selected category id. */
  value: string | undefined;
  categories: CategoryPickerOption[];
  onValueChange: (id: string) => void;
  /** Shows the "Nova categoria" row when provided. */
  onCreateCategory?: (input: { name: string; icon: CategoryIconName }) => Promise<void> | void;
  isCreating?: boolean;
  error?: string;
  label?: string;
  className?: string;
};

const newCategoryIcons: { icon: CategoryIconName; label: string }[] = [
  { icon: "pill", label: "Remédios" },
  { icon: "shirt", label: "Roupas" },
  { icon: "baby", label: "Bebê" },
  { icon: "dog", label: "Pets" },
  { icon: "music", label: "Música" },
  { icon: "gift", label: "Presentes" },
  { icon: "book-open", label: "Livros" },
  { icon: "dumbbell", label: "Academia" },
  { icon: "scissors", label: "Beleza" },
  { icon: "wine", label: "Bebidas" },
  { icon: "heart", label: "Favoritos" },
  { icon: "ticket", label: "Ingressos" },
];

const MOST_USED_COUNT = 3;
const NEW_ITEM_VALUE = "__new-category__";

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

const hintClassName =
  "[&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:tracking-[1px] [&_[cmdk-group-heading]]:text-subtle-foreground";

const itemClassName =
  "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm outline-none data-[selected=true]:bg-secondary";

/** Category field: a picker that lists categories (most used first), searches and creates new ones. */
export function CategoryPicker({
  value,
  categories,
  onValueChange,
  onCreateCategory,
  isCreating = false,
  error,
  label = "Categoria",
  className,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "new">("list");
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState<CategoryIconName>(newCategoryIcons[0]!.icon);

  const selected = categories.find((category) => category.id === value);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setView("list");
      setSearch("");
      setNewName("");
      setNewIcon(newCategoryIcons[0]!.icon);
    }
    setOpen(next);
  };

  const select = (id: string) => {
    onValueChange(id);
    setOpen(false);
  };

  const create = async () => {
    const name = newName.trim();
    if (!name || !onCreateCategory) return;
    try {
      await onCreateCategory({ name, icon: newIcon });
    } catch {
      return;
    }
    setNewName("");
    setView("list");
  };

  const query = normalize(search);
  const searching = query !== "";
  const matches = searching
    ? categories.filter((category) => normalize(category.name).includes(query))
    : categories;
  const mostUsed = searching
    ? []
    : [...categories]
        .filter((category) => category.usageCount > 0)
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, MOST_USED_COUNT);
  const mostUsedIds = new Set(mostUsed.map((category) => category.id));
  const others = matches.filter((category) => !mostUsedIds.has(category.id));

  const renderOption = (category: CategoryPickerOption) => {
    const isSelected = category.id === value;
    return (
      <CommandPrimitive.Item
        key={category.id}
        value={category.id}
        onSelect={() => select(category.id)}
        data-checked={isSelected ? "true" : undefined}
        className={cn(itemClassName, isSelected && "bg-primary-soft")}
      >
        <CategoryIcon
          icon={category.icon}
          color={category.color}
          tone="soft"
          className="size-[30px] rounded-[9px] [&_svg]:size-4"
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-foreground",
            isSelected ? "font-bold" : "font-medium",
          )}
        >
          {category.name}
        </span>
        {isSelected ? (
          <>
            <Check aria-hidden className="size-4 shrink-0 text-primary" />
            <span className="sr-only">(selecionada)</span>
          </>
        ) : null}
      </CommandPrimitive.Item>
    );
  };

  return (
    <FilterSurface
      open={open}
      onOpenChange={handleOpenChange}
      title="Categoria"
      popoverClassName="w-[340px] max-w-[calc(100vw-2rem)] p-2.5"
      trigger={
        <PickerField
          label={label}
          placeholder="Selecionar categoria"
          valueLabel={selected?.name}
          icon={
            selected ? (
              <CategoryIcon
                icon={selected.icon}
                color={selected.color}
                tone="soft"
                className="size-6 rounded-md [&_svg]:size-3.5"
              />
            ) : (
              <Tag />
            )
          }
          error={error}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={className}
        />
      }
    >
      {(isDesktop) =>
        view === "new" ? (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Voltar"
                onClick={() => setView("list")}
                className="flex items-center justify-center rounded-sm px-1 py-0.5 text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <ArrowLeft aria-hidden className="size-4" />
              </button>
              <h3 className="text-[15px] font-bold text-foreground">Nova categoria</h3>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="new-category-name"
                className="text-xs font-semibold text-muted-foreground"
              >
                Nome
              </label>
              <input
                id="new-category-name"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void create();
                  }
                }}
                autoFocus
                autoComplete="off"
                maxLength={40}
                placeholder="Ex.: Farmácia"
                className="rounded-md border border-transparent bg-background px-3.5 py-[11px] text-[15px] font-medium text-foreground outline-none placeholder:text-subtle-foreground focus:border-[1.5px] focus:border-primary"
              />
            </div>
            <div role="group" aria-labelledby="new-category-icon" className="flex flex-col gap-1.5">
              <span id="new-category-icon" className="text-xs font-semibold text-muted-foreground">
                Ícone
              </span>
              <div className="flex justify-between">
                {newCategoryIcons.map(({ icon, label: iconLabel }) => {
                  const Icon = categoryIcons[icon];
                  const isSelected = icon === newIcon;
                  return (
                    <button
                      key={icon}
                      type="button"
                      aria-label={iconLabel}
                      aria-pressed={isSelected}
                      onClick={() => setNewIcon(icon)}
                      className={cn(
                        "flex size-11 items-center justify-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        isSelected
                          ? "bg-primary text-white"
                          : "border border-border bg-background text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <Icon aria-hidden className="size-5" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView("list")}
                className="rounded-lg border border-border bg-card px-[18px] py-[11px] text-sm font-bold text-foreground outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void create()}
                disabled={newName.trim() === "" || isCreating}
                className="flex-1 rounded-lg bg-primary px-[18px] py-[11px] text-sm font-bold text-primary-foreground outline-none hover:bg-primary-strong focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        ) : (
          <CommandPrimitive
            label="Buscar categoria"
            shouldFilter={false}
            loop
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 rounded-md bg-background px-3 py-2.5">
              <Search aria-hidden className="size-[15px] shrink-0 text-subtle-foreground" />
              <CommandPrimitive.Input
                value={search}
                onValueChange={setSearch}
                autoFocus={isDesktop}
                placeholder="Buscar categoria"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-subtle-foreground"
              />
            </div>
            <CommandPrimitive.List
              className={cn("flex flex-col gap-0.5", isDesktop && "max-h-[364px] overflow-y-auto")}
            >
              {matches.length === 0 ? (
                <p className="px-2.5 py-3 text-sm text-muted-foreground">
                  Nenhuma categoria encontrada
                </p>
              ) : null}
              {mostUsed.length > 0 ? (
                <CommandPrimitive.Group heading="MAIS USADAS" className={hintClassName}>
                  <div className="flex flex-col gap-0.5">{mostUsed.map(renderOption)}</div>
                </CommandPrimitive.Group>
              ) : null}
              {others.length > 0 ? (
                <CommandPrimitive.Group
                  heading={searching ? "RESULTADOS" : "TODAS"}
                  className={hintClassName}
                >
                  <div className="flex flex-col gap-0.5">{others.map(renderOption)}</div>
                </CommandPrimitive.Group>
              ) : null}
              {onCreateCategory ? (
                <>
                  <hr className="my-1 border-border" />
                  <CommandPrimitive.Item
                    value={NEW_ITEM_VALUE}
                    onSelect={() => {
                      setNewName(search.trim());
                      setView("new");
                    }}
                    className={itemClassName}
                  >
                    <span
                      aria-hidden
                      className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-primary-soft text-primary-strong"
                    >
                      <Plus className="size-4" />
                    </span>
                    <span className="text-sm font-bold text-primary-strong">Nova categoria</span>
                  </CommandPrimitive.Item>
                </>
              ) : null}
            </CommandPrimitive.List>
          </CommandPrimitive>
        )
      }
    </FilterSurface>
  );
}
