"use client";

import { format, isValid, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { ptBR } from "react-day-picker/locale";

import { fieldControlClassName } from "@/components/atoms/text-field";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DateFieldProps = {
  /** ISO date (yyyy-MM-dd), or an empty string when nothing is picked. */
  value: string;
  onChange: (isoDate: string) => void;
  /** ISO date. Earlier days are disabled. */
  minDate?: string;
  /** ISO date of the month shown first when there is no value. Defaults to the min date or today. */
  defaultMonth?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

const toDate = (iso: string | undefined) => {
  if (!iso) return undefined;
  const date = parseISO(iso);
  return isValid(date) ? date : undefined;
};

/** Date picker field: a button showing dd/MM/yyyy that opens a pt-BR calendar in a popover. */
export function DateField({
  value,
  onChange,
  minDate,
  defaultMonth,
  placeholder = "dd/mm/aaaa",
  id,
  name,
  disabled,
  className,
  ...aria
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);
  const min = toDate(minDate);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          className={cn(
            "relative flex w-full min-w-0 items-center border bg-clip-padding text-left outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
            fieldControlClassName,
            "pl-11.5",
            className,
          )}
          {...aria}
        >
          <CalendarIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-4 size-4.5 text-subtle-foreground"
          />
          <span className={cn("truncate", !selected && "text-subtle-foreground")}>
            {selected ? format(selected, "dd/MM/yyyy") : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          defaultMonth={selected ?? toDate(defaultMonth) ?? min}
          disabled={min ? { before: min } : undefined}
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
