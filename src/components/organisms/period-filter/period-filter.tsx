"use client";

import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import { ptBR as dateFnsPtBR } from "date-fns/locale";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  History,
  Luggage,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { Fragment, useState } from "react";
import type { DateRange } from "react-day-picker";
import { getDefaultClassNames } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";

import { FilterButton } from "@/components/molecules/filter-button";
import { FilterSurface } from "@/components/molecules/filter-surface";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import {
  formatPeriodDate,
  periodPresetLabels,
  periodPresets,
  type PeriodFilterValue,
  type PeriodPreset,
} from "./period-label";

export type { PeriodFilterValue, PeriodPreset } from "./period-label";

const presetIcons: Record<PeriodPreset, LucideIcon> = {
  today: Sun,
  yesterday: History,
  last3: CalendarClock,
  all: Luggage,
  custom: CalendarRange,
};

export type PeriodFilterProps = {
  value: PeriodFilterValue;
  onValueChange: (value: PeriodFilterValue) => void;
  /** ISO date (yyyy-MM-dd). Earlier days are disabled. */
  minDate?: string;
  /** ISO date (yyyy-MM-dd). Later days are disabled. */
  maxDate?: string;
  className?: string;
};

const toDate = (iso: string | undefined) => {
  if (!iso) return undefined;
  const date = parseISO(iso);
  return isValid(date) ? date : undefined;
};
const toIso = (date: Date) => format(date, "yyyy-MM-dd");

function daysSummary(range: DateRange | undefined) {
  if (!range?.from) return "Nenhum dia selecionado";
  const days = differenceInCalendarDays(range.to ?? range.from, range.from) + 1;
  return days === 1 ? "1 dia selecionado" : `${days} dias selecionados`;
}

const defaultClassNames = getDefaultClassNames();

export function PeriodFilter({
  value,
  onValueChange,
  minDate,
  maxDate,
  className,
}: PeriodFilterProps) {
  const [open, setOpen] = useState(false);
  const [stagedPreset, setStagedPreset] = useState<PeriodPreset | null>(value?.preset ?? null);
  const [range, setRange] = useState<DateRange | undefined>();

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setStagedPreset(value?.preset ?? null);
      const from = toDate(value?.from);
      setRange(from ? { from, to: toDate(value?.to) } : undefined);
    }
    setOpen(next);
  };

  const min = toDate(minDate);
  const max = toDate(maxDate);
  const disabled = [...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])];
  const isInWindow = (date: Date) => (!min || date >= min) && (!max || date <= max);
  const startMonth = toDate(value?.from) ?? max ?? new Date();

  const choosePreset = (preset: PeriodPreset) => {
    if (preset === "custom") {
      setStagedPreset("custom");
      return;
    }
    onValueChange({ preset });
    setOpen(false);
  };

  const apply = () => {
    if (!range?.from) return;
    onValueChange({
      preset: "custom",
      from: toIso(range.from),
      to: toIso(range.to ?? range.from),
    });
    setOpen(false);
  };

  const clear = () => {
    onValueChange(null);
    setOpen(false);
  };

  return (
    <FilterSurface
      open={open}
      onOpenChange={handleOpenChange}
      title="Período"
      popoverClassName="w-[580px] max-w-[calc(100vw-2rem)] overflow-hidden p-0"
      mobileAction={
        <button
          type="button"
          onClick={clear}
          className="rounded-md text-sm font-semibold text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Limpar
        </button>
      }
      trigger={
        <FilterButton
          icon={<CalendarDays />}
          label={value ? periodPresetLabels[value.preset] : "Período"}
          active={value !== null}
          open={open}
          className={className}
        />
      }
    >
      {(isDesktop) => {
        const showPicker = isDesktop || stagedPreset === "custom";
        const picker = (
          <div className={cn("flex flex-col gap-3.5", isDesktop && "p-[18px]")}>
            <div className="flex items-center gap-2.5">
              {(["Início", "Fim"] as const).map((label, index) => {
                const iso = (label === "Início" ? range?.from : range?.to) ?? undefined;
                return (
                  <Fragment key={label}>
                    {index === 1 ? (
                      <ArrowRight aria-hidden className="size-4 shrink-0 text-subtle-foreground" />
                    ) : null}
                    <label
                      className={cn(
                        "flex min-w-0 flex-1 flex-col gap-px rounded-lg border bg-background px-3 py-2 focus-within:ring-3 focus-within:ring-ring/50",
                        label === "Fim" ? "border-primary" : "border-border",
                      )}
                    >
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {label}
                      </span>
                      <input
                        readOnly
                        value={iso ? formatPeriodDate(toIso(iso)) : ""}
                        placeholder="dd mmm aaaa"
                        className="w-full bg-transparent p-0 text-sm font-semibold text-foreground outline-none placeholder:font-semibold placeholder:text-subtle-foreground"
                      />
                    </label>
                  </Fragment>
                );
              })}
            </div>
            <Calendar
              mode="range"
              locale={ptBR}
              selected={range}
              onSelect={(next) => {
                setRange(next);
                setStagedPreset("custom");
              }}
              defaultMonth={startMonth}
              disabled={disabled}
              showOutsideDays={false}
              modifiers={min || max ? { inWindow: isInWindow } : undefined}
              modifiersClassNames={{ inWindow: "in-window" }}
              formatters={{
                formatWeekdayName: (date) =>
                  format(date, "EEEEE", { locale: dateFnsPtBR }).toUpperCase(),
              }}
              className={cn(
                "w-full p-0 [--cell-size:--spacing(9)]",
                "[&_button[data-range-middle=true]]:bg-primary-soft [&_button[data-range-middle=true]]:text-sm [&_button[data-range-middle=true]]:font-bold [&_button[data-range-middle=true]]:text-primary-strong",
                "[&_button[data-range-end=true]]:text-sm [&_button[data-range-end=true]]:font-bold [&_button[data-range-start=true]]:text-sm [&_button[data-range-start=true]]:font-bold",
              )}
              classNames={{
                root: "w-full",
                nav: "absolute inset-x-0 top-[3px] flex w-full items-center justify-between gap-1",
                button_previous: cn(
                  buttonVariants({ variant: "ghost" }),
                  "size-[30px] rounded-[10px] p-0 select-none aria-disabled:opacity-50",
                  defaultClassNames.button_previous,
                ),
                button_next: cn(
                  buttonVariants({ variant: "ghost" }),
                  "size-[30px] rounded-[10px] p-0 select-none aria-disabled:opacity-50",
                  defaultClassNames.button_next,
                ),
                caption_label: "text-[15px] font-bold text-foreground select-none",
                weekday:
                  "flex-1 text-[11px] font-bold text-subtle-foreground uppercase select-none",
                day: "group/day relative aspect-auto h-10 w-full rounded-md p-0 text-center select-none md:h-[42px]",
                day_button: cn(
                  defaultClassNames.day_button,
                  "aspect-auto h-full min-w-0 rounded-md text-sm font-normal disabled:opacity-100",
                  "group-[.in-window]/day:not-data-[range-end=true]:not-data-[range-start=true]:bg-primary-soft group-[.in-window]/day:not-data-[range-end=true]:not-data-[range-start=true]:font-semibold group-[.in-window]/day:not-data-[range-end=true]:not-data-[range-start=true]:text-primary-strong",
                ),
                range_start: "bg-primary-soft after:bg-primary-soft",
                range_end: "bg-primary-soft after:bg-primary-soft",
                disabled: "text-subtle-foreground",
                today:
                  "bg-transparent font-semibold text-primary data-[selected=true]:rounded-none",
              }}
            />
          </div>
        );

        const renderPreset = (preset: PeriodPreset) => {
          const Icon = presetIcons[preset];
          const selected = stagedPreset === preset;
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={selected}
              onClick={() => choosePreset(preset)}
              className={cn(
                "flex items-center gap-2.5 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isDesktop
                  ? "rounded-md p-2.5"
                  : "rounded-full border px-4 py-[9px] font-semibold whitespace-nowrap",
                selected
                  ? cn(
                      "bg-primary-soft text-primary-strong",
                      isDesktop ? "font-bold" : "border-primary",
                    )
                  : cn(
                      "text-foreground hover:bg-muted",
                      isDesktop ? "font-medium" : "border-border bg-card",
                    ),
              )}
            >
              {isDesktop ? (
                <Icon
                  aria-hidden
                  className={cn("size-4", selected ? "text-primary" : "text-muted-foreground")}
                />
              ) : null}
              {periodPresetLabels[preset]}
            </button>
          );
        };

        if (isDesktop) {
          return (
            <div className="grid grid-cols-[190px_1fr]">
              <div className="flex flex-col gap-0.5 bg-background p-3">
                <p className="pb-2 text-[11px] font-bold tracking-[1px] text-subtle-foreground">
                  PERÍODO
                </p>
                {periodPresets.map(renderPreset)}
              </div>
              <div className="flex flex-col">
                {picker}
                <div className="px-[18px]">
                  <hr className="border-border" />
                </div>
                <div className="flex items-center justify-between gap-3 px-[18px] py-3">
                  <span className="text-[13px] font-semibold text-muted-foreground">
                    {daysSummary(range)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      className="h-auto bg-card px-4 py-2.25"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={apply}
                      disabled={!range?.from}
                      className="h-auto px-4.5 py-2.25"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">{periodPresets.slice(0, 3).map(renderPreset)}</div>
              <div className="flex gap-2">{periodPresets.slice(3).map(renderPreset)}</div>
            </div>
            {showPicker ? (
              <>
                {picker}
                <Button
                  type="button"
                  size="lg"
                  onClick={apply}
                  disabled={!range?.from}
                  className="h-auto w-full py-4 text-base font-bold"
                >
                  Aplicar
                </Button>
              </>
            ) : null}
          </div>
        );
      }}
    </FilterSurface>
  );
}
