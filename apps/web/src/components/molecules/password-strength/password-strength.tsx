import { cva } from "class-variance-authority";
import { Circle, CircleCheck } from "lucide-react";

import { evaluatePassword, type PasswordLevel } from "@bordo/shared/common";
import { cn } from "@/lib/utils";

const segmentVariants = cva("h-1.25 flex-1 rounded-[3px]", {
  variants: {
    state: {
      off: "bg-secondary",
      weak: "bg-destructive",
      medium: "bg-warning",
      strong: "bg-success",
    },
  },
});

const labelVariants = cva("text-[13px] font-bold", {
  variants: {
    level: {
      empty: "",
      weak: "text-destructive-ink",
      medium: "text-warning-ink",
      strong: "text-success-ink",
    },
  },
});

export type PasswordStrengthProps = Omit<React.ComponentProps<"div">, "children"> & {
  password: string;
};

/** Strength meter and requirement checklist for a password. Presentational. */
export function PasswordStrength({ password, className, ...props }: PasswordStrengthProps) {
  const { rules, score, level, levelLabel } = evaluatePassword(password);
  // A weak password only lights the first segment, like the design.
  const litSegments = level === "weak" ? 1 : score;
  const unmet = rules.filter((rule) => !rule.met).map((rule) => rule.label);
  const segmentState: Exclude<PasswordLevel, "empty"> | "off" = level === "empty" ? "off" : level;

  const summary =
    level === "empty"
      ? "Digite uma senha."
      : `Senha ${levelLabel.toLowerCase()}.${unmet.length ? ` Falta: ${unmet.join(", ")}.` : " Todos os requisitos atendidos."}`;

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <div className="flex items-center gap-3">
        <div aria-hidden className="flex flex-1 gap-1.5">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={segmentVariants({ state: index < litSegments ? segmentState : "off" })}
            />
          ))}
        </div>
        {level !== "empty" ? (
          <span aria-hidden className={labelVariants({ level })}>
            {levelLabel}
          </span>
        ) : null}
      </div>
      <ul className="flex flex-col gap-2 pt-0.5">
        {rules.map((rule) => (
          <li key={rule.id} className="flex items-center gap-2.5 text-[13.5px]">
            {rule.met ? (
              <CircleCheck aria-hidden className="size-4.25 shrink-0 text-success" />
            ) : (
              <Circle aria-hidden className="size-4.25 shrink-0 text-subtle-foreground" />
            )}
            <span className={rule.met ? "font-medium text-foreground" : "text-muted-foreground"}>
              {rule.label}
              <span className="sr-only">{rule.met ? " (atendido)" : " (pendente)"}</span>
            </span>
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="sr-only">
        {summary}
      </p>
    </div>
  );
}
