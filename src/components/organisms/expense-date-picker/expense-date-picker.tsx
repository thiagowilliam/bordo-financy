"use client";

import { format } from "date-fns";
import { ptBR as dateFnsPtBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { getDefaultClassNames } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";

import { FilterSurface } from "@/components/molecules/filter-surface";
import { PickerField } from "@/components/molecules/picker-field";
import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { formatExpenseDate, toDate, toIso } from "./expense-date-label";

export type ExpenseDatePickerProps = {
  /** ISO date (yyyy-MM-dd) of the expense. */
  value: string;
  onValueChange: (isoDate: string) => void;
  /** Field label, e.g. "Data" or "Data de pagamento". */
  label: string;
  /** ISO date of the current day, used for "Hoje" and "Ir para hoje". */
  today: string;
  /** ISO dates of the trip window, highlighted in the calendar and used to count "Dia N". */
  tripStartDate: string;
  tripEndDate: string;
  error?: string;
  className?: string;
};

const defaultClassNames = getDefaultClassNames();

/** Date field for an expense: shows the trip day and opens a pt-BR calendar with the trip window. */
export function ExpenseDatePicker({
  value,
  onValueChange,
  label,
  today,
  tripStartDate,
  tripEndDate,
  error,
  className,
}: ExpenseDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => toDate(value) ?? toDate(today) ?? new Date());

  const selected = toDate(value);
  const todayDate = toDate(today);
  const start = toDate(tripStartDate);
  const end = toDate(tripEndDate);
  const isInTrip = (date: Date) => (!start || date >= start) && (!end || date <= end);

  const handleOpenChange = (next: boolean) => {
    if (next) setMonth(selected ?? todayDate ?? new Date());
    setOpen(next);
  };

  const choose = (date: Date) => {
    onValueChange(toIso(date));
    setOpen(false);
  };

  return (
    <FilterSurface
      open={open}
      onOpenChange={handleOpenChange}
      title={label}
      popoverClassName="w-[396px] max-w-[calc(100vw-2rem)] p-4"
      trigger={
        <PickerField
          label={label}
          placeholder="Selecionar data"
          valueLabel={formatExpenseDate(value, today, tripStartDate)}
          icon={<CalendarIcon className="text-primary" />}
          error={error}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={className}
        />
      }
    >
      <div className="flex flex-col gap-2.5">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          onSelect={(date) => {
            if (date) choose(date);
          }}
          month={month}
          onMonthChange={setMonth}
          showOutsideDays={false}
          modifiers={{ inTrip: isInTrip }}
          modifiersClassNames={{ inTrip: "in-trip" }}
          formatters={{
            formatWeekdayName: (date) =>
              format(date, "EEEEE", { locale: dateFnsPtBR }).toUpperCase(),
          }}
          className="w-full p-0 [--cell-size:--spacing(9)]"
          classNames={{
            root: "w-full",
            nav: "absolute inset-x-0 top-[3px] flex w-full items-center justify-between gap-1",
            button_previous: cn(
              buttonVariants({ variant: "ghost" }),
              "size-[30px] rounded-md p-0 select-none aria-disabled:opacity-50",
              defaultClassNames.button_previous,
            ),
            button_next: cn(
              buttonVariants({ variant: "ghost" }),
              "size-[30px] rounded-md p-0 select-none aria-disabled:opacity-50",
              defaultClassNames.button_next,
            ),
            caption_label: "text-[15px] font-bold text-foreground select-none",
            weekday: "flex-1 text-[11px] font-bold text-subtle-foreground uppercase select-none",
            day: "group/day relative aspect-auto h-10 w-full max-w-[46px] justify-self-center rounded-md p-0 text-center select-none",
            day_button: cn(
              defaultClassNames.day_button,
              "aspect-auto h-full min-w-0 rounded-md text-sm font-normal text-subtle-foreground",
              "group-[.in-trip]/day:bg-primary-soft group-[.in-trip]/day:font-semibold group-[.in-trip]/day:text-primary-strong",
              "data-[selected-single=true]:bg-primary data-[selected-single=true]:font-bold data-[selected-single=true]:text-white",
            ),
            today: "bg-transparent",
          }}
        />
        <hr className="border-border" />
        <div className="flex items-center gap-3.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <span aria-hidden className="size-3 rounded-[4px] bg-primary-soft" />
            Dias da viagem
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <span aria-hidden className="size-3 rounded-[4px] bg-primary" />
            Selecionado
          </span>
          <button
            type="button"
            onClick={() => todayDate && choose(todayDate)}
            className="ml-auto rounded-sm text-xs font-bold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Ir para hoje
          </button>
        </div>
      </div>
    </FilterSurface>
  );
}
