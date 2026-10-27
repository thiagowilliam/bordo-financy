import { Mail } from "lucide-react";

import { CurrencySelect } from "@/components/atoms/currency-select";
import { TextField } from "@/components/atoms/text-field";
import { FormField } from "@/components/molecules/form-field";
import { Button } from "@/components/ui/button";
import type { SupportedCurrency } from "@/lib/currencies";
import { cn } from "@/lib/utils";

export type ProfileInfoSectionProps = Omit<React.ComponentProps<"section">, "children"> & {
  name: string;
  onNameChange: (value: string) => void;
  nameError?: string;
  currency: SupportedCurrency;
  onCurrencyChange: (value: SupportedCurrency) => void;
  email: string;
  emailVerified: boolean;
  onChangeEmail: () => void;
  disabled?: boolean;
};

/** Personal information card: name, main currency and the read-only email row. */
export function ProfileInfoSection({
  name,
  onNameChange,
  nameError,
  currency,
  onCurrencyChange,
  email,
  emailVerified,
  onChangeEmail,
  disabled,
  className,
  ...props
}: ProfileInfoSectionProps) {
  return (
    <section
      aria-labelledby="profile-info-title"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 md:gap-5 md:p-7",
        className,
      )}
      {...props}
    >
      <h2 id="profile-info-title" className="text-[17px] font-bold text-foreground md:text-lg">
        Informações pessoais
      </h2>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Nome" error={nameError}>
          {(control) => (
            <TextField
              {...control}
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              autoComplete="name"
              disabled={disabled}
            />
          )}
        </FormField>
        <FormField label="Moeda principal" hint="Usada para somar viagens em moedas diferentes.">
          {(control) => (
            <CurrencySelect
              {...control}
              value={currency}
              onValueChange={onCurrencyChange}
              disabled={disabled}
            />
          )}
        </FormField>
      </div>
      <hr className="border-border" />
      <div className="flex flex-wrap items-center gap-3.5">
        <span
          aria-hidden="true"
          className="flex size-10.5 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground"
        >
          <Mail className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-medium text-muted-foreground">E-mail</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="min-w-0 truncate font-semibold text-foreground">{email}</span>
            {emailVerified ? (
              <span className="inline-flex items-center rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-ink">
                Verificado
              </span>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onChangeEmail}
          disabled={disabled}
          className="h-auto px-2 py-1.5 font-bold text-primary"
        >
          Alterar
        </Button>
      </div>
    </section>
  );
}
